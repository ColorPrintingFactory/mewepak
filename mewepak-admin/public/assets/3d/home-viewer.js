( function() {
	'use strict';

	function HomePouchViewer( container ) {
		this.container = container;
		this.canvas = container.querySelector( '[data-mewepak-home-3d-canvas]' );
		this.loading = container.querySelector( '.mewepak-home-3d__loading' );
		this.modelUrl = container.dataset.modelUrl || '';
		this.bgColor = container.dataset.bgColor || '#f8fafc';
		this.pouchColor = container.dataset.pouchColor || '#00cfca';
		this.model = null;
		this.frame = null;

		this.init();
		this.addLights();
		this.addControls();
		this.loadModel();
		this.bindViewButtons();
		this.animate();
	}

	HomePouchViewer.prototype.init = function() {
		var width = this.container.clientWidth || 600;
		var height = this.container.clientHeight || 420;

		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( this.bgColor );

		this.camera = new THREE.PerspectiveCamera( 32, width / height, 0.01, 100 );
		this.camera.position.set( 0, 0.15, 3.0 );

		try {
			this.renderer = new THREE.WebGLRenderer( {
				canvas: this.canvas,
				antialias: true,
				alpha: false
			} );
		} catch ( error ) {
			this.showError( '3D preview requires WebGL.' );
			throw error;
		}
		this.renderer.setSize( width, height );
		this.renderer.setPixelRatio( Math.min( window.devicePixelRatio || 1, 2 ) );
		this.renderer.outputEncoding = THREE.sRGBEncoding;
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1.18;

		var self = this;
		this.resizeObserver = new ResizeObserver( function() {
			self.resize();
		} );
		this.resizeObserver.observe( this.container );
	};

	HomePouchViewer.prototype.addLights = function() {
		var ambient = new THREE.HemisphereLight( 0xffffff, 0x334155, 1.2 );
		this.scene.add( ambient );

		var key = new THREE.DirectionalLight( 0xffffff, 1.8 );
		key.position.set( 2.5, 3.5, 4 );
		this.scene.add( key );

		var fill = new THREE.DirectionalLight( 0x00cfca, 0.55 );
		fill.position.set( -3, 1.5, 2 );
		this.scene.add( fill );
	};

	HomePouchViewer.prototype.addControls = function() {
		this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
		this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.08;
		this.controls.enablePan = false;
		this.controls.autoRotate = true;
		this.controls.autoRotateSpeed = 1.1;
		this.controls.minDistance = 2;
		this.controls.maxDistance = 5;
		this.controls.target.set( 0, 0, 0 );
		this.controls.update();
	};

	HomePouchViewer.prototype.loadModel = function() {
		if ( ! this.modelUrl ) {
			this.showError( '3D model not configured.' );
			return;
		}

		var self = this;
		var loader = new THREE.GLTFLoader();
		loader.load(
			this.modelUrl,
			function( gltf ) {
				self.model = gltf.scene;
				self.fitModelToView();
				self.tintModel();
				self.scene.add( self.model );
				if ( self.loading ) {
					self.loading.hidden = true;
				}
			},
			undefined,
			function() {
				self.showError( 'Unable to load 3D preview.' );
			}
		);
	};

	HomePouchViewer.prototype.fitModelToView = function() {
		if ( ! this.model ) return;

		var box = new THREE.Box3().setFromObject( this.model );
		var size = new THREE.Vector3();
		var center = new THREE.Vector3();
		box.getSize( size );
		box.getCenter( center );

		var maxAxis = Math.max( size.x, size.y, size.z ) || 1;
		var scale = 1.9 / maxAxis;

		this.model.scale.setScalar( scale );
		this.model.position.set(
			-center.x * scale,
			-center.y * scale,
			-center.z * scale
		);
	};

	HomePouchViewer.prototype.tintModel = function() {
		if ( ! this.model ) return;
		var accent = new THREE.Color( this.pouchColor );
		this.model.traverse( function( child ) {
			if ( ! child.isMesh || ! child.material ) return;
			if ( Array.isArray( child.material ) ) {
				child.material.forEach( function( material ) {
					material.color = material.color || accent;
					material.needsUpdate = true;
				} );
			} else if ( child.material.color ) {
				child.material.color.lerp( accent, 0.12 );
				child.material.needsUpdate = true;
			}
		} );
	};

	HomePouchViewer.prototype.bindViewButtons = function() {
		var card = this.container.closest( '[data-mewepak-home-3d-card]' );
		if ( ! card ) return;

		var self = this;
		card.querySelectorAll( '[data-home-3d-view]' ).forEach( function( button ) {
			button.addEventListener( 'click', function() {
				var view = button.dataset.home3dView;
				card.querySelectorAll( '[data-home-3d-view]' ).forEach( function( btn ) {
					btn.classList.toggle( 'is-active', btn === button );
				} );

				self.controls.autoRotate = false;
				if ( 'z' === view ) {
					self.camera.position.set( 0, 3.0, 0.05 );
				} else {
					self.camera.position.set( 0, 0.15, 3.0 );
				}
				self.controls.target.set( 0, 0, 0 );
				self.controls.update();
			} );
		} );
	};

	HomePouchViewer.prototype.resize = function() {
		var width = this.container.clientWidth;
		var height = this.container.clientHeight;
		if ( ! width || ! height ) return;
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( width, height );
	};

	HomePouchViewer.prototype.showError = function( message ) {
		if ( this.loading ) {
			this.loading.hidden = false;
			this.loading.textContent = message;
		}
	};

	HomePouchViewer.prototype.animate = function() {
		var self = this;
		this.frame = requestAnimationFrame( function() {
			self.animate();
		} );
		this.controls.update();
		this.renderer.render( this.scene, this.camera );
	};

	function init( container ) {
		if ( container.dataset.home3dReady ) return;
		container.dataset.home3dReady = 'true';
		new HomePouchViewer( container );
	}

	function boot() {
		var viewers = document.querySelectorAll( '[data-mewepak-home-3d]' );
		if ( ! viewers.length || ! window.THREE || ! THREE.OrbitControls || ! THREE.GLTFLoader ) return;

		if ( 'IntersectionObserver' in window ) {
			var observer = new IntersectionObserver( function( entries ) {
				entries.forEach( function( entry ) {
					if ( entry.isIntersecting ) {
						init( entry.target );
						observer.unobserve( entry.target );
					}
				} );
			}, { rootMargin: '160px 0px' } );
			viewers.forEach( function( viewer ) { observer.observe( viewer ); } );
		} else {
			viewers.forEach( init );
		}
	}

	if ( 'loading' === document.readyState ) {
		document.addEventListener( 'DOMContentLoaded', boot );
	} else {
		boot();
	}
}() );
