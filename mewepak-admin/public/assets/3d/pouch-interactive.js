( function() {
	'use strict';

	var MODEL_URL = '/assets/3d/doypack.glb';

	class PouchViewer {
		constructor( container ) {
			this.container = container;
			this.modelUrl = container.dataset.modelUrl || MODEL_URL;
			container.querySelector('[data-model-poster]')?.remove();
			this.bgColor = container.dataset.bgColor || '#f0f0f0';
			this.model = null;
			this.frontImage = null;
			this.backImage = null;

			this.init();
			this.createUI();
			if (container.dataset.frontArtwork === 'false') container.querySelector('#upload-front').style.display = 'none';
			if (container.dataset.backArtwork === 'false') container.querySelector('#upload-back').style.display = 'none';
			this.addLights();
			this.addControls();
			this.loadModel();
			this.animate();
		}

		init() {
			this.wrapper = document.createElement( 'div' );
			this.wrapper.style.cssText = 'display:flex;width:100%;height:100%;';

			this.viewport = document.createElement( 'div' );
			this.viewport.style.cssText = 'flex:1;position:relative;min-width:0;';
			this.wrapper.appendChild( this.viewport );

			this.container.appendChild( this.wrapper );

			var width = this.viewport.clientWidth || 600;
			var height = this.viewport.clientHeight || 500;

			this.scene = new THREE.Scene();
			this.scene.background = new THREE.Color( this.bgColor );

			this.camera = new THREE.PerspectiveCamera( 35, width / height, 0.01, 100 );
			this.camera.position.set( 0, 0, 2.5 );

			this.renderer = new THREE.WebGLRenderer( { antialias: true } );
			this.renderer.setSize( width, height );
			this.renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );
			this.renderer.outputEncoding = THREE.sRGBEncoding;
			this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
			this.renderer.toneMappingExposure = 1.2;
			this.viewport.appendChild( this.renderer.domElement );

			// Loading indicator
			this.loadingEl = document.createElement( 'div' );
			this.loadingEl.className = 'mewepak-3d-loading';
			this.loadingEl.textContent = 'Loading 3D model...';
			this.viewport.appendChild( this.loadingEl );

			var self = this;
			var ro = new ResizeObserver( function() {
				var w = self.viewport.clientWidth;
				var h = self.viewport.clientHeight;
				if ( w && h ) {
					self.camera.aspect = w / h;
					self.camera.updateProjectionMatrix();
					self.renderer.setSize( w, h );
				}
			} );
			ro.observe( this.viewport );
		}

		createUI() {
			var panel = document.createElement( 'div' );
			panel.className = 'mewepak-3d-panel';
			panel.innerHTML =
				'<h4>Packaging Preview</h4>' +
				'<div class="mewepak-3d-tip">' +
					'<strong>Image Guide</strong>' +
					'<p>Recommended ratio <b>3:4</b> (e.g. 1500×2000px). Place your main design in the center 40% of the image — that area maps to the front face.</p>' +
				'</div>' +
				'<div class="mewepak-3d-field">' +
					'<label>Front Design</label>' +
					'<div class="mewepak-3d-upload" id="upload-front">' +
						'<input type="file" id="texture-front" accept="image/*" />' +
						'<span>Upload front artwork</span>' +
					'</div>' +
				'</div>' +
				'<div class="mewepak-3d-field">' +
					'<label>Back Design</label>' +
					'<div class="mewepak-3d-upload" id="upload-back">' +
						'<input type="file" id="texture-back" accept="image/*" />' +
						'<span>Upload back artwork</span>' +
					'</div>' +
				'</div>' +
				'<button type="button" id="clear-textures" class="mewepak-3d-btn-clear" style="display:none;">Remove All Designs</button>' +
				'<div class="mewepak-3d-divider"></div>' +
				'<div class="mewepak-3d-field">' +
					'<label>Background</label>' +
					'<div class="mewepak-3d-colors">' +
						'<span class="color-swatch active" data-color="#f0f0f0" style="background:#f0f0f0;"></span>' +
						'<span class="color-swatch" data-color="#1a1a2e" style="background:#1a1a2e;"></span>' +
						'<span class="color-swatch" data-color="#ffffff" style="background:#ffffff;border:1px solid #ddd;"></span>' +
						'<span class="color-swatch" data-color="#2d3436" style="background:#2d3436;"></span>' +
					'</div>' +
				'</div>' +
				'<div class="mewepak-3d-divider"></div>' +
				'<div class="mewepak-3d-field">' +
					'<label>Auto Rotate</label>' +
					'<label class="mewepak-toggle"><input type="checkbox" id="auto-rotate" checked /><span></span></label>' +
				'</div>' +
				'<div class="mewepak-3d-hint">Drag to rotate · Scroll to zoom</div>';

			this.wrapper.appendChild( panel );
			this.panel = panel;

			var self = this;

			// Upload handlers
			this.setupUpload( '#texture-front', '#upload-front', 'front' );
			this.setupUpload( '#texture-back', '#upload-back', 'back' );

			// Clear button
			panel.querySelector( '#clear-textures' ).addEventListener( 'click', function() {
				self.frontImage = null;
				self.backImage = null;
				self.applyTextures();
				panel.querySelectorAll( '.mewepak-3d-upload' ).forEach( function( el ) {
					el.classList.remove( 'has-file' );
				} );
				panel.querySelector( '#upload-front span' ).textContent = 'Upload front artwork';
				panel.querySelector( '#upload-back span' ).textContent = 'Upload back artwork';
				panel.querySelectorAll( 'input[type="file"]' ).forEach( function( el ) { el.value = ''; } );
				this.style.display = 'none';
			} );

			// Background color
			panel.querySelectorAll( '.color-swatch' ).forEach( function( swatch ) {
				swatch.addEventListener( 'click', function() {
					panel.querySelectorAll( '.color-swatch' ).forEach( function( s ) { s.classList.remove( 'active' ); } );
					swatch.classList.add( 'active' );
					self.scene.background = new THREE.Color( swatch.dataset.color );
				} );
			} );

			// Auto rotate toggle
			panel.querySelector( '#auto-rotate' ).addEventListener( 'change', function() {
				self.controls.autoRotate = this.checked;
			} );
		}

		setupUpload( inputSel, areaSel, side ) {
			var self = this;
			var panel = this.panel;
			var input = panel.querySelector( inputSel );
			var area = panel.querySelector( areaSel );

			input.addEventListener( 'change', function( e ) {
				if ( e.target.files && e.target.files[0] ) {
					self.loadTexture( e.target.files[0], side );
					area.classList.add( 'has-file' );
					area.querySelector( 'span' ).textContent = e.target.files[0].name.substring( 0, 22 );
					panel.querySelector( '#clear-textures' ).style.display = 'block';
				}
			} );

			area.addEventListener( 'dragover', function( e ) { e.preventDefault(); area.classList.add( 'dragover' ); } );
			area.addEventListener( 'dragleave', function() { area.classList.remove( 'dragover' ); } );
			area.addEventListener( 'drop', function( e ) {
				e.preventDefault();
				area.classList.remove( 'dragover' );
				if ( e.dataTransfer.files && e.dataTransfer.files[0] ) {
					self.loadTexture( e.dataTransfer.files[0], side );
					area.classList.add( 'has-file' );
					area.querySelector( 'span' ).textContent = e.dataTransfer.files[0].name.substring( 0, 22 );
					panel.querySelector( '#clear-textures' ).style.display = 'block';
				}
			} );
		}

		loadTexture( file, side ) {
			var self = this;
			var reader = new FileReader();
			reader.onload = function( e ) {
				var img = new Image();
				img.onload = function() {
					if ( side === 'front' ) {
						self.frontImage = img;
					} else {
						self.backImage = img;
					}
					self.applyTextures();
				};
				img.src = e.target.result;
			};
			reader.readAsDataURL( file );
		}

		loadModel() {
			var self = this;
			var loader = new THREE.GLTFLoader();

			loader.load( this.modelUrl, function( gltf ) {
				self.model = gltf.scene;

				// Auto-center and scale the model
				var box = new THREE.Box3().setFromObject( self.model );
				var size = box.getSize( new THREE.Vector3() );
				var center = box.getCenter( new THREE.Vector3() );

				// Scale to fit nicely in viewport (target ~2 units tall)
				var maxDim = Math.max( size.x, size.y, size.z );
				var scale = 1.4 / maxDim;
				self.model.scale.setScalar( scale );

				// Re-center
				box.setFromObject( self.model );
				box.getCenter( center );
				self.model.position.sub( center );

				self.scene.add( self.model );

				// Store meshes by name for targeted texture application
				self.meshes = [];
				self.frontMesh = null;
				self.backMesh = null;

				self.model.traverse( function( child ) {
					if ( child.isMesh ) {
						self.meshes.push( child );
						child.userData.originalMaterial = child.material.clone();

						var name = child.name.toLowerCase();
						if ( name.indexOf( 'front' ) !== -1 ) {
							self.frontMesh = child;
						} else if ( name.indexOf( 'back' ) !== -1 ) {
							self.backMesh = child;
						}

					}
				} );

				// Adjust camera based on model size
				self.camera.position.set( 0, 0, 2.5 );
				self.controls.target.set( 0, 0, 0 );
				self.controls.update();

				// Hide loading
				self.loadingEl.style.display = 'none';

			}, function( progress ) {
				if ( progress.total ) {
					var pct = Math.round( progress.loaded / progress.total * 100 );
					self.loadingEl.textContent = 'Loading... ' + pct + '%';
				}
			}, function( error ) {
				console.error( 'Error loading model:', error );
				self.loadingEl.textContent = 'Failed to load model';
				self.loadingEl.style.color = '#ef4444';
			} );
		}

		applyTextures() {
		if ( ! this.meshes || this.meshes.length === 0 ) return;

		var self = this;

		function makeTexture( img, mirror ) {
			var tex = new THREE.Texture( img );
			tex.needsUpdate = true;
			tex.flipY = false;
			tex.encoding = THREE.sRGBEncoding;
			if ( mirror ) {
				tex.wrapS = THREE.RepeatWrapping;
				tex.repeat.x = -1;
				tex.offset.x = 1;
			}
			return tex;
		}

		// Reset all meshes to original material
		this.meshes.forEach( function( mesh ) {
			mesh.material = mesh.userData.originalMaterial.clone();
			mesh.material.needsUpdate = true;
		} );

		// Apply front image to front mesh（mirror=true 修正镜像）
		if ( this.frontImage && this.frontMesh ) {
			var tex = makeTexture( this.frontImage, true );
			this.frontMesh.material = this.frontMesh.userData.originalMaterial.clone();
			this.frontMesh.material.map = tex;
			this.frontMesh.material.color.set( 0xffffff );
			this.frontMesh.material.needsUpdate = true;
		}

		// Apply back image to back mesh（back面UV已镜像，mirror=false）
		if ( this.backImage && this.backMesh ) {
			var tex = makeTexture( this.backImage, true );
			this.backMesh.material = this.backMesh.userData.originalMaterial.clone();
			this.backMesh.material.map = tex;
			this.backMesh.material.color.set( 0xffffff );
			this.backMesh.material.needsUpdate = true;
		}

		// Fallback
		if ( ! this.frontMesh && ! this.backMesh ) {
			var img = this.frontImage || this.backImage;
			if ( img ) {
				var tex = makeTexture( img, true );
				this.meshes.forEach( function( mesh ) {
					mesh.material = mesh.userData.originalMaterial.clone();
					mesh.material.map = tex;
					mesh.material.color.set( 0xffffff );
					mesh.material.needsUpdate = true;
				} );
			}
		}
	}

		addLights() {
			// Ambient
			this.scene.add( new THREE.AmbientLight( 0xffffff, 0.6 ) );

			// Key light
			var key = new THREE.DirectionalLight( 0xffffff, 0.8 );
			key.position.set( 3, 4, 5 );
			this.scene.add( key );

			// Fill light
			var fill = new THREE.DirectionalLight( 0xffffff, 0.3 );
			fill.position.set( -3, 2, -2 );
			this.scene.add( fill );

			// Rim / back light
			var rim = new THREE.DirectionalLight( 0xffffff, 0.2 );
			rim.position.set( 0, 1, -4 );
			this.scene.add( rim );

			// Bottom fill
			var bottom = new THREE.DirectionalLight( 0xffffff, 0.15 );
			bottom.position.set( 0, -3, 2 );
			this.scene.add( bottom );
		}

		addControls() {
			this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
			this.controls.enableDamping = true;
			this.controls.dampingFactor = 0.08;
			this.controls.enablePan = false;
			this.controls.minDistance = 1.5;
			this.controls.maxDistance = 10;
			this.controls.autoRotate = true;
			this.controls.autoRotateSpeed = 0.6;
			this.controls.target.set( 0, 0, 0 );
		}

		animate() {
			var self = this;
			requestAnimationFrame( function() { self.animate(); } );
			this.controls.update();
			this.renderer.render( this.scene, this.camera );
		}
	}

	function showViewerFallback( container, poster ) {
		var fallback = document.createElement( 'div' );
		fallback.style.cssText = 'display:grid;justify-items:center;align-content:center;gap:16px;min-height:480px;padding:24px;text-align:center;color:var(--chrome-deep,#102b35);';
		var image = poster || document.createElement( 'img' );
		if ( !poster ) image.src = '/assets/client-design/images/30e138afb1ec62c7.webp';
		image.alt = 'Mewepak printed stand-up pouch';
		image.style.cssText = 'width:min(100%,240px);height:240px;object-fit:contain;border-radius:10px;';
		var message = document.createElement( 'p' );
		message.setAttribute( 'role', 'status' );
		message.textContent = 'Interactive 3D needs WebGL. You can still use our artwork preview.';
		var link = document.createElement( 'a' );
		link.className = 'button button-primary';
		link.href = '/inquiry/#artwork-preview';
		link.textContent = 'Open artwork preview';
		fallback.append( image, message, link );
		container.replaceChildren( fallback );
	}

	function initViewers() {
		var containers = document.querySelectorAll( '.mewepak-3d-container' );
		containers.forEach( function( container ) {
			if ( container.dataset.initialized ) return;
			container.dataset.initialized = 'true';

			var observer = new IntersectionObserver( function( entries ) {
				entries.forEach( function( entry ) {
					if ( entry.isIntersecting ) {
						observer.unobserve( container );
						var poster = container.querySelector( '[data-model-poster]' );
						try {
							new PouchViewer( container );
						} catch ( error ) {
							console.warn( 'Interactive pouch preview unavailable:', error );
							showViewerFallback( container, poster );
						}
					}
				} );
			}, { threshold: 0.1 } );

			observer.observe( container );
		} );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', initViewers );
	} else {
		initViewers();
	}
} )();
