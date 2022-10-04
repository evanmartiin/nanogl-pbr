
import Chunk from './Chunk'
import ChunksSlots from './ChunksSlots'
import { GLContext, isWebgl2 } from "nanogl/types";

type GlslVersion = '100' | '300 es'


class ShaderVersion extends Chunk {

  private version: GlslVersion;

  constructor( v : GlslVersion = '100' ) {
    super(true, false);
    this.version = v;
  }


  set( v : GlslVersion ) {
    if( this.version !== v ){
      this.version = v;
      this.invalidateCode();
    }
  }

  get() : GlslVersion{
    return this.version;
  }


  _genCode( slots : ChunksSlots ) {
    var s = `#version ${this.version}`;
    slots.add('version', s);
  }

  guessFromContext( gl:GLContext ){
    this.set( isWebgl2(gl) ? '300 es' : '100' );
  }

}

export default ShaderVersion
