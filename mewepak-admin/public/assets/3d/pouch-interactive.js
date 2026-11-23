( function() {
	'use strict';

	var MODEL_URL = '/assets/3d/doypack.glb?v=studio-1';

	function preparePouchArtwork( image, ratio = [3, 4] ) {
		var sample = document.createElement( 'canvas' );
		var scale = Math.min( 1, 1600 / Math.max( image.naturalWidth, image.naturalHeight ) );
		var width = sample.width = Math.max( 1, Math.round( image.naturalWidth * scale ) );
		var height = sample.height = Math.max( 1, Math.round( image.naturalHeight * scale ) );
		var source = sample.getContext( '2d', { willReadFrequently: true } );
		source.drawImage( image, 0, 0, width, height );
		var pixels = source.getImageData( 0, 0, width, height ).data;
		var left = width, right = -1, top = height, bottom = -1, solid = 0;
		var hasTransparency = false;
		var rowEdges = [];
		for ( var y = 0; y < height; y++ ) {
			var first = width, last = -1;
			for ( var x = 0; x < width; x++ ) {
				var alpha = pixels[( y * width + x ) * 4 + 3];
				if ( alpha < 255 ) hasTransparency = true;
				if ( alpha < 224 ) continue;
				first = Math.min( first, x );
				last = x;
				solid++;
			}
			rowEdges[y] = [first, last];
			if ( last >= first ) {
				left = Math.min( left, first );
				right = Math.max( right, last );
				top = Math.min( top, y );
				bottom = y;
			}
		}
		if ( !hasTransparency && Math.abs( width / height - ratio[0] / ratio[1] ) < 0.01 ) return image;

		var artwork = document.createElement( 'canvas' );
		var target = artwork.getContext( '2d' );
		var unit = 1200 / Math.max( ...ratio );
		artwork.width = Math.round( unit * ratio[0] );
		artwork.height = Math.round( unit * ratio[1] );
		var cropWidth = right - left + 1, cropHeight = bottom - top + 1;
		var isCutout = cropWidth >= width * 0.45 && cropHeight >= height * 0.45
			&& solid >= cropWidth * cropHeight * 0.60;
		if ( !isCutout ) {
			// Preserve the placement of graphics with intentionally transparent backgrounds.
			var fullScale = Math.min( artwork.width / width, artwork.height / height );
			var fullWidth = width * fullScale, fullHeight = height * fullScale;
			target.fillStyle = '#ffffff';
			target.fillRect( 0, 0, artwork.width, artwork.height );
			target.drawImage( sample, ( artwork.width - fullWidth ) / 2, ( artwork.height - fullHeight ) / 2, fullWidth, fullHeight );
			return artwork;
		}

		var fit = Math.min( artwork.width / cropWidth, artwork.height / cropHeight );
		var fitWidth = cropWidth * fit, fitHeight = cropHeight * fit;
		var offsetX = ( artwork.width - fitWidth ) / 2, offsetY = ( artwork.height - fitHeight ) / 2;
		var fill = target.createImageData( artwork.width, artwork.height );
		for ( var row = 0; row < artwork.height; row++ ) {
			var inputRow = Math.max( top, Math.min( bottom, top + Math.round( ( row - offsetY ) / fit ) ) );
			var edges = rowEdges[inputRow];
			if ( edges[1] - edges[0] < cropWidth * 0.35 ) {
				// Very narrow rows at rounded ends do not give useful edge colors.
				inputRow = inputRow < ( top + bottom ) / 2
					? Math.min( bottom, top + Math.floor( cropHeight * 0.03 ) )
					: Math.max( top, bottom - Math.floor( cropHeight * 0.03 ) );
				edges = rowEdges[inputRow];
			}
			var inset = Math.max( 0, Math.round( ( edges[1] - edges[0] ) * 0.035 ) );
			var start = ( inputRow * width + Math.min( right, edges[0] + inset ) ) * 4;
			var end = ( inputRow * width + Math.max( left, edges[1] - inset ) ) * 4;
			for ( var col = 0; col < artwork.width; col++ ) {
				var ratio = Math.max( 0, Math.min( 1, ( col - offsetX ) / fitWidth ) );
				var destination = ( row * artwork.width + col ) * 4;
				for ( var channel = 0; channel < 3; channel++ ) {
					var a = pixels[start + 3] >= 224 ? pixels[start + channel] : 255;
					var b = pixels[end + 3] >= 224 ? pixels[end + channel] : 255;
					fill.data[destination + channel] = a + ( b - a ) * ratio;
				}
				fill.data[destination + 3] = 255;
			}
		}
		target.putImageData( fill, 0, 0 );
		target.drawImage( sample, left, top, cropWidth, cropHeight, offsetX, offsetY, fitWidth, fitHeight );
		return artwork;
	}

	const defaultModel = {
		id: 'stand-up-pouch', format: 'stand-up-pouch', name: 'Stand-up pouch',
		url: MODEL_URL, poster: '/assets/3d/doypack-studio.webp',
		ratio: [3, 4], mirror: true, front: true, back: true,
	};

	const homePhrases = JSON.parse( document.getElementById( 'mewepak-home-language' )?.textContent || '{}' ).phrases;
	const translate = (text) => homePhrases?.[text] || text;

	function quoteTarget( model ) {
		const locale = homePhrases ? '/' + document.documentElement.lang : '';
		return locale + '/inquiry/' + ( model.format ? '?format=' + encodeURIComponent( model.format ) : '' ) + '#quote-request';
	}

	class PouchViewer {
		constructor( container, catalogue, selected ) {
			this.container = container;
			this.catalogue = catalogue;
			this.selection = selected;
			this.model = null;
			this.artwork = {};
			this.uploads = {};
			this.loadVersion = 0;
			this.loader = new THREE.GLTFLoader();
			this.homeStudio = container.closest( '[data-home-preview]' );
			this.section = this.homeStudio || container.closest( '.preview-tool-section' );
			this.formatSelect = this.homeStudio?.querySelector( '[data-packaging-select]' );
			this.options = this.section?.querySelector( '[data-packaging-options]' );
			this.quoteLinks = this.homeStudio ? [] : [...document.querySelectorAll( '[data-preview-quote]' )];
			this.reducedMotion = matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
			this.init();
			this.createUI();
			this.addLights();
			this.addControls();
			this.bindSelection( selected );
			this.select( selected );
			this.visible = true;
			if ( this.homeStudio ) {
				new IntersectionObserver( ([entry]) => { this.visible = entry.isIntersecting; } ).observe( this.viewport );
			}
			this.animate();
		}

		init() {
			this.wrapper = document.createElement( 'div' );
			this.wrapper.className = 'mewepak-3d-workspace';
			this.viewport = document.createElement( 'div' );
			this.viewport.className = 'mewepak-3d-viewport';
			this.wrapper.append( this.viewport );

			this.scene = new THREE.Scene();
			this.scene.background = new THREE.Color( this.container.dataset.bgColor || '#eff3f0' );
			this.camera = new THREE.PerspectiveCamera( 35, 1, 0.01, 100 );
			this.renderer = new THREE.WebGLRenderer( { antialias: true } );
			this.renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );
			this.renderer.outputEncoding = THREE.sRGBEncoding;
			this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
			this.renderer.toneMappingExposure = 1.08;
			this.renderer.domElement.setAttribute( 'aria-label', translate( this.homeStudio
				? 'Drag to rotate. Ctrl + scroll or pinch to zoom.'
				: 'Drag to rotate. Scroll or pinch to zoom.' ) );
			if ( this.homeStudio ) {
				this.renderer.domElement.addEventListener( 'wheel', (event) => {
					if ( !event.ctrlKey ) event.stopImmediatePropagation();
				}, { capture: true, passive: true } );
			}
			this.viewport.append( this.renderer.domElement );

			this.poster = document.createElement( 'img' );
			this.poster.className = 'mewepak-3d-poster';
			this.poster.alt = '';
			this.loadingEl = document.createElement( 'p' );
			this.loadingEl.className = 'mewepak-3d-loading';
			this.loadingEl.setAttribute( 'role', 'status' );
			this.viewport.append( this.poster, this.loadingEl );
			this.container.replaceChildren( this.wrapper );

			const resize = new ResizeObserver( () => {
				const width = this.viewport.clientWidth;
				const height = this.viewport.clientHeight;
				if ( !width || !height ) return;
				if ( !this.controls ) return;
				const fittedDistance = this.fitDistance( width / height );
				const offset = this.camera.position.clone().sub( this.controls.target );
				if ( offset.lengthSq() ) {
					this.camera.position.copy( offset.setLength( fittedDistance ) ).add( this.controls.target );
				}
				this.camera.aspect = width / height;
				this.camera.updateProjectionMatrix();
				this.renderer.setSize( width, height, false );
			} );
			resize.observe( this.viewport );
		}

		createUI() {
			const panel = document.createElement( 'aside' );
			panel.className = 'mewepak-3d-panel';
			panel.innerHTML = `
				<h3 class="mewepak-3d-model-name"></h3>
				<p class="mewepak-3d-guide"></p>
				<div class="mewepak-3d-artwork"></div>
				<p class="mewepak-3d-upload-status" role="status" hidden></p>
				<button type="button" class="mewepak-3d-btn-clear" hidden>${translate( 'Remove artwork' )}</button>
				<details class="mewepak-3d-view-settings">
					<summary>${translate( 'View settings' )}</summary>
					<div class="mewepak-3d-field">
						<span>${translate( 'Background' )}</span>
						<div class="mewepak-3d-colors"></div>
					</div>
					<label class="mewepak-3d-rotate"><input type="checkbox"> ${translate( 'Auto-rotate' )}</label>
				</details>
				<a class="mewepak-3d-quote" data-preview-quote>${translate( 'Request a Quote' )} <span aria-hidden="true">↗</span></a>
			`;
			this.wrapper.append( panel );
			this.panel = panel;
			this.modelName = panel.querySelector( '.mewepak-3d-model-name' );
			this.guide = panel.querySelector( '.mewepak-3d-guide' );
			this.status = panel.querySelector( '.mewepak-3d-upload-status' );
			this.clear = panel.querySelector( '.mewepak-3d-btn-clear' );
			this.quoteLinks.push( panel.querySelector( '[data-preview-quote]' ) );
			this.addUpload( 'front' );
			this.addUpload( 'back' );

			this.clear.addEventListener( 'click', () => {
				for ( const upload of Object.values( this.uploads ) ) upload.version++;
				this.artwork = {};
				this.showUploadStatus( '' );
				this.updateUploads();
				this.applyTextures();
			} );

			const colors = panel.querySelector( '.mewepak-3d-colors' );
			for ( const [label, value] of [ ['Mist', '#eff3f0'], ['White', '#ffffff'], ['Charcoal', '#293439'], ['Sand', '#d9d0bd'] ] ) {
				const button = document.createElement( 'button' );
				button.type = 'button';
				button.className = 'color-swatch';
				button.style.backgroundColor = value;
				button.setAttribute( 'aria-label', translate( label + ' background' ) );
				button.setAttribute( 'aria-pressed', label === 'Mist' ? 'true' : 'false' );
				button.addEventListener( 'click', () => {
					colors.querySelector( '[aria-pressed="true"]' )?.setAttribute( 'aria-pressed', 'false' );
					button.setAttribute( 'aria-pressed', 'true' );
					this.scene.background.set( value );
				} );
				colors.append( button );
			}

			const rotate = panel.querySelector( '.mewepak-3d-rotate input' );
			rotate.checked = !this.reducedMotion;
			rotate.addEventListener( 'change', () => { this.controls.autoRotate = rotate.checked; } );
		}

		addUpload( side ) {
			const row = document.createElement( 'label' );
			row.className = 'mewepak-3d-upload';
			const input = document.createElement( 'input' );
			input.type = 'file';
			input.accept = 'image/png,image/jpeg,image/webp';
			const title = document.createElement( 'strong' );
			const caption = document.createElement( 'span' );
			row.append( title, caption, input );
			this.panel.querySelector( '.mewepak-3d-artwork' ).append( row );
			const upload = { row, input, title, caption, version: 0 };
			this.uploads[side] = upload;
			input.addEventListener( 'change', () => {
				if ( input.files[0] ) this.loadTexture( input.files[0], side );
				input.value = '';
			} );
			row.addEventListener( 'dragover', ( event ) => { event.preventDefault(); row.classList.add( 'dragover' ); } );
			row.addEventListener( 'dragleave', () => row.classList.remove( 'dragover' ) );
			row.addEventListener( 'drop', ( event ) => {
				event.preventDefault();
				row.classList.remove( 'dragover' );
				if ( event.dataTransfer.files[0] ) this.loadTexture( event.dataTransfer.files[0], side );
			} );
		}

		updateUploads() {
			for ( const [side, upload] of Object.entries( this.uploads ) ) {
				const hasFile = Boolean( this.artwork[side] );
				upload.row.hidden = !this.selection[side];
				upload.row.classList.toggle( 'has-file', hasFile );
				upload.title.textContent = translate( side === 'back' ? 'Back artwork · optional' :
					this.selection.repeat > 1 ? 'Film artwork' : 'Front artwork' );
				upload.caption.textContent = hasFile ? this.artwork[side].name : translate( 'Choose an image or drop it here' );
			}
			this.clear.hidden = !Object.keys( this.artwork ).length;
		}

		showUploadStatus( message ) {
			this.status.textContent = message;
			this.status.hidden = !message;
		}

		async loadTexture( file, side ) {
			const upload = this.uploads[side];
			const version = ++upload.version;
			this.showUploadStatus( '' );
			if ( !/^image\/(?:png|jpeg|webp)$/.test( file.type ) && !/\.(?:png|jpe?g|webp)$/i.test( file.name ) ) {
				this.showUploadStatus( translate( 'Choose a PNG, JPEG or WebP image.' ) );
				return;
			}
			const src = URL.createObjectURL( file );
			try {
				const image = new Image();
				image.src = src;
				await image.decode();
				if ( upload.version !== version ) return;
				this.artwork[side] = { image, name: file.name, textures: new Map() };
				this.updateUploads();
				this.applyTextures();
			} catch {
				if ( upload.version === version ) this.showUploadStatus( translate( 'This image could not be opened. Try another file.' ) );
			} finally {
				URL.revokeObjectURL( src );
			}
		}

		bindSelection( selected ) {
			if ( this.formatSelect ) {
				this.formatSelect.disabled = false;
				this.formatSelect.addEventListener( 'change', () => {
					const next = this.catalogue.find( (model) => model.id === this.formatSelect.value );
					if ( next ) this.select( next );
				} );
			}
			if ( !this.options ) return;
			this.options.addEventListener( 'click', (event) => {
				const link = event.target.closest( '[data-packaging-option]' );
				if ( !link || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ) return;
				const next = this.catalogue.find( (model) => model.id === link.dataset.packagingOption );
				if ( !next ) return;
				event.preventDefault();
				if ( next.id === this.selection.id && !this.loadFailed ) return;
				if ( next.id !== this.selection.id ) history.pushState( { packagingModel: next.id }, '', next.href + '#packaging-preview' );
				this.select( next );
			} );
			window.addEventListener( 'popstate', (event) => {
				const next = this.catalogue.find( (model) => model.id === event.state?.packagingModel ) || selected;
				if ( next.id !== this.selection.id ) this.select( next );
			} );
		}

		select( next ) {
			this.selection = next;
			this.loadFailed = false;
			const name = translate( next.name );
			this.container.setAttribute( 'aria-label', translate( 'Interactive 3D preview — {format}' ).replace( '{format}', name ) );
			this.modelName.textContent = name;
			this.guide.textContent = next.ratio
				? translate( 'Use edge-to-edge artwork ({ratio}). PNG, JPG or WebP.' ).replace( '{ratio}', next.ratio.join( ':' ) )
				: translate( 'Use flat PNG, JPG or WebP artwork that matches the printable face.' );
			if ( this.formatSelect ) this.formatSelect.value = next.id;
			this.options?.querySelectorAll( '[data-packaging-option]' ).forEach( (link) => {
				if ( link.dataset.packagingOption === next.id ) link.setAttribute( 'aria-current', 'true' );
				else link.removeAttribute( 'aria-current' );
			} );
			const activeLink = this.options?.querySelector( '[aria-current="true"]' );
			if ( activeLink && this.options.scrollWidth > this.options.clientWidth ) {
				const gallery = this.options.getBoundingClientRect();
				const card = activeLink.getBoundingClientRect();
				if ( card.left < gallery.left ) this.options.scrollLeft += card.left - gallery.left - 3;
				else if ( card.right > gallery.right ) this.options.scrollLeft += card.right - gallery.right + 3;
			}
			for ( const link of this.quoteLinks ) link.href = quoteTarget( next );
			this.showUploadStatus( '' );
			this.updateUploads();
			this.loadModel( next );
		}

		fitDistance( aspect ) {
			return Math.max( 2.76, 2.34 / aspect );
		}

		disposeModel( model ) {
			const textures = new Set();
			const materials = new Set();
			model.traverse( (mesh) => {
				if ( !mesh.isMesh ) return;
				mesh.geometry.dispose();
				for ( const material of [].concat( mesh.material, mesh.userData.sourceMaterial || [] ) ) {
					materials.add( material );
					for ( const value of Object.values( material ) ) if ( value?.isTexture ) textures.add( value );
				}
			} );
			for ( const material of materials ) material.dispose();
			for ( const texture of textures ) texture.dispose();
		}

		loadModel( format ) {
			const version = ++this.loadVersion;
			if ( this.model ) {
				this.scene.remove( this.model );
				this.disposeModel( this.model );
				this.model = null;
			}
			this.loadingEl.hidden = false;
			this.loadingEl.replaceChildren( translate( 'Loading {format}…' ).replace( '{format}', translate( format.name ) ) );
			this.poster.hidden = !format.poster;
			if ( format.poster ) this.poster.src = format.poster;

			this.loader.load( format.url, (gltf) => {
				const model = gltf.scene;
				if ( version !== this.loadVersion ) {
					this.disposeModel( model );
					return;
				}

				const box = new THREE.Box3().setFromObject( model );
				const dimensions = box.getSize( new THREE.Vector3() );
				const max = Math.max( dimensions.x, dimensions.y, dimensions.z );
				if ( !max ) {
					this.disposeModel( model );
					this.showModelError( format );
					return;
				}
				model.scale.multiplyScalar( 1.4 / max );
				model.position.sub( box.setFromObject( model ).getCenter( new THREE.Vector3() ) );

				const meshes = this.meshes = [];
				const sides = this.sides = { front: [], back: [] };
				model.traverse( (mesh) => {
					if ( !mesh.isMesh ) return;
					meshes.push( mesh );
					mesh.userData.sourceMaterial = mesh.material;
					const name = mesh.name.toLowerCase();
					if ( name.includes( 'front' ) ) sides.front.push( mesh );
					else if ( name.includes( 'back' ) ) sides.back.push( mesh );
				} );
				this.model = model;
				this.scene.add( model );
				this.applyTextures();
				this.pointCamera();
				this.poster.hidden = true;
				this.loadingEl.hidden = true;
			}, undefined, () => {
				if ( version === this.loadVersion ) this.showModelError( format );
			} );
		}

		showModelError( format ) {
			this.loadFailed = true;
			const retry = document.createElement( 'button' );
			retry.type = 'button';
			retry.textContent = translate( 'Retry' );
			retry.addEventListener( 'click', () => this.select( format ), { once: true } );
			this.loadingEl.replaceChildren( translate( 'The model could not load.' ) + ' ', retry );
		}

		pointCamera() {
			const format = this.selection;
			const direction = format.ratio
				? new THREE.Vector3( format.repeat > 1 ? 1.26 : .68, format.repeat > 1 ? .89 : .24, 2.5 )
				: new THREE.Vector3( 0, 0, 1 );
			this.controls.target.set( 0, 0, 0 );
			this.camera.position.copy( direction.setLength( this.fitDistance( this.camera.aspect ) ) );
			this.controls.update();
		}

		applyTextures() {
			if ( !this.model ) return;
			const format = this.selection;
			const maps = {};
			for ( const [side, file] of Object.entries( this.artwork ) ) {
				if ( !format[side] ) continue;
				const key = format.ratio?.join( ':' );
				if ( key && !file.textures.has( key ) ) file.textures.set( key, preparePouchArtwork( file.image, format.ratio ) );
				const tex = new THREE.Texture( file.textures.get( key ) || file.image );
				tex.needsUpdate = true;
				tex.flipY = false;
				tex.encoding = THREE.sRGBEncoding;
				tex.anisotropy = Math.min( 8, this.renderer.capabilities.getMaxAnisotropy() );
				if ( format.mirror || format.repeat > 1 ) {
					tex.wrapS = THREE.RepeatWrapping;
					tex.repeat.x = format.mirror ? -1 : format.repeat;
					if ( format.mirror ) tex.offset.x = 1;
				}
				maps[side] = tex;
			}
			const named = this.sides.front.length || this.sides.back.length;
			const touched = new Set();
			for ( const mesh of this.meshes ) {
				const source = mesh.userData.sourceMaterial;
				if ( mesh.material !== source ) {
					for ( const material of [].concat( mesh.material ) ) {
						touched.add( material.map );
						material.dispose();
					}
				}
				const map = named
					? this.sides.front.includes( mesh ) ? maps.front : this.sides.back.includes( mesh ) ? maps.back : undefined
					: maps.front || maps.back;
				const withMap = (material) => {
					const clone = material.clone();
					clone.map = map;
					clone.color.set( 0xffffff );
					clone.needsUpdate = true;
					return clone;
				};
				mesh.material = !map ? source : Array.isArray( source ) ? source.map( withMap ) : withMap( source );
				if ( map ) map.usedByModel = true;
			}
			for ( const texture of touched ) texture?.dispose();
			for ( const texture of Object.values( maps ) ) if ( !texture.usedByModel ) texture.dispose();
		}

		addLights() {
			this.scene.add( new THREE.AmbientLight( 0xffffff, .65 ) );
			for ( const [intensity, x, y, z] of [ [.88, 3, 4, 5], [.29, -3, 2, -2], [.28, 0, 1, -4], [.13, 0, -3, 2] ] ) {
				const light = new THREE.DirectionalLight( 0xffffff, intensity );
				light.position.set( x, y, z );
				this.scene.add( light );
			}
		}

		addControls() {
			this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
			this.controls.enableDamping = true;
			this.controls.dampingFactor = .08;
			this.controls.enablePan = false;
			this.controls.minDistance = 1.5;
			this.controls.maxDistance = 10;
			this.controls.autoRotate = !this.reducedMotion;
			this.controls.autoRotateSpeed = .46;
			this.pointCamera();
		}

		animate() {
			requestAnimationFrame( () => this.animate() );
			if ( !this.model || !this.visible || document.hidden ) return;
			this.controls.update();
			this.renderer.render( this.scene, this.camera );
		}
	}

	function showViewerFallback( container, model ) {
		const fallback = document.createElement( 'div' );
		fallback.className = 'mewepak-3d-fallback';
		if ( model.poster ) {
			const image = document.createElement( 'img' );
			image.src = model.poster;
			image.alt = translate( model.name );
			fallback.append( image );
		}
		const message = document.createElement( 'p' );
		message.setAttribute( 'role', 'status' );
		message.textContent = translate( container.closest( '[data-home-preview]' )
			? 'Interactive 3D is unavailable. You can still view packaging formats and request a quote.'
			: 'Your browser cannot display interactive 3D. You can still choose a format and request a quote.' );
		const link = document.createElement( 'a' );
		link.className = 'mewepak-3d-quote';
		link.href = quoteTarget( model );
		link.textContent = translate( 'Request a Quote' );
		fallback.append( message, link );
		container.replaceChildren( fallback );
	}

	let engineLoad;
	function loadEngine() {
		return engineLoad ??= ['three.min.js', 'OrbitControls.js', 'GLTFLoader.js'].reduce( (ready, file) =>
			ready.then( () => new Promise( (resolve, reject) => {
				const script = document.createElement( 'script' );
				script.src = '/assets/3d/' + file;
				script.onload = resolve;
				script.onerror = reject;
				document.head.append( script );
			} ) ), Promise.resolve() );
	}

	function initViewers() {
		for ( const container of document.querySelectorAll( '.mewepak-3d-container' ) ) {
			if ( container.dataset.initialized ) continue;
			container.dataset.initialized = 'true';
			const catalogue = container.dataset.packagingModels ? JSON.parse( container.dataset.packagingModels ) : [defaultModel];
			const selected = catalogue.find( (model) => model.id === container.dataset.activeModel ) || catalogue[0];
			const observer = new IntersectionObserver( async (entries) => {
				if ( !entries.some( (entry) => entry.isIntersecting ) ) return;
				observer.disconnect();
				try {
					if ( !window.THREE?.GLTFLoader ) await loadEngine();
					new PouchViewer( container, catalogue, selected );
				} catch ( error ) {
					console.warn( 'Interactive packaging preview unavailable:', error );
					showViewerFallback( container, selected );
				}
			}, { rootMargin: '280px' } );
			observer.observe( container );
		}
	}

	if ( document.readyState === 'loading' ) document.addEventListener( 'DOMContentLoaded', initViewers );
	else initViewers();
} )();
