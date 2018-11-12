var Program      = require( 'nanogl/program' );
var Config       = require( 'nanogl-state/config' );

var ProgramCache = require( './lib/program-cache' );
var Input        = require('./lib/input' );
var Flag         = require('./lib/flag' );
var Enum         = require('./lib/enum' );
var Precision    = require('./lib/shader-precision' );
var Version      = require('./lib/shader-version' );
var ChunksList   = require('./lib/chunks-tree' );


var M4           = require( 'gl-matrix' ).mat4.create();


var MAT_ID = 'std';

function StandardMaterial( gl ){
  this.ibl = null;
  this.prg = null;

  this._mask = 1;

  var webgl2 = gl.texImage3D !== undefined;

  this.inputs          = new ChunksList();

  this.version         = this.inputs.add( new Version( webgl2? '300 es' : '100' ) );
  this.precision       = this.inputs.add( new Precision( 'mediump' ) );
  this.shaderid        = this.inputs.add( new Flag ( 'id_'+MAT_ID,  true  ) );

  this.iAlbedo         = this.inputs.add( new Input( 'albedo',          3 ) );
  this.iSpecular       = this.inputs.add( new Input( 'specular',        3 ) );
  this.iGloss          = this.inputs.add( new Input( 'gloss',           1 ) );
  this.iNormal         = this.inputs.add( new Input( 'normal',          3 ) );
  this.iOcclusion      = this.inputs.add( new Input( 'occlusion',       1 ) );
  this.iCavity         = this.inputs.add( new Input( 'cavity',          1 ) );
  this.iCavityStrength = this.inputs.add( new Input( 'cavityStrength',  2 ) );
  this.iEmissive       = this.inputs.add( new Input( 'emissive',        1 ) );
  this.iEmissiveScale  = this.inputs.add( new Input( 'emissiveScale',   1 ) );
  this.iFresnel        = this.inputs.add( new Input( 'fresnel',         3 ) );
  this.iGamma          = this.inputs.add( new Input( 'gamma',           1 ) );
  this.iExposure       = this.inputs.add( new Input( 'exposure',        1 ) );

  this.conserveEnergy  = this.inputs.add( new Flag ( 'conserveEnergy',  true  ) );
  this.perVertexIrrad  = this.inputs.add( new Flag ( 'perVertexIrrad',  false ) );
  this.glossNearest    = this.inputs.add( new Flag ( 'glossNearest',    false ) );
  this.useDerivatives  = this.inputs.add( new Flag ( 'useDerivatives',  false ) );

  this.gammaMode       = this.inputs.add( new Enum( 'gammaMode',[
    'GAMMA_NONE',
    'GAMMA_STD',
    'GAMMA_2_2',
    'GAMMA_TB'
  ]));


  this.config     = new Config();
  this._prgcache  = ProgramCache.getCache( gl );

  this._vertSrc   = require( './glsl/pbr.vert' )();
  this._fragSrc   = require( './glsl/pbr.frag' )();

}

StandardMaterial.prototype = {


  setIBL : function( ibl ){
    this.ibl = ibl;
  },


  setLightSetup : function( setup ){
    this.inputs.addChunks( setup.getChunks( 'std' ) );
  },


  // render time !
  // ----------
  prepare : function( node, camera ){

    if( this._isDirty() ){
      this.compile();
    }

    // this.

    var prg = this.prg;
    prg.use();

    prg.setupInputs( this );

    this.ibl.setupProgram( prg );

    // matrices
    camera.modelViewProjectionMatrix( M4, node._wmatrix );
    prg.uMVP(          M4            );
    prg.uWorldMatrix(  node._wmatrix );

    //
    prg.uCameraPosition( camera._wposition );

  },




  // need recompilation
  _isDirty : function(){
    if( this.prg === null || this.inputs._isDirty ){
      return true;
    }
    return false;
  },


  compile : function(){
    if( this.prg !== null ){
      this._prgcache.release( this.prg );
    }
    this.prg = this._prgcache.compile( this );
  }



};

module.exports = StandardMaterial;