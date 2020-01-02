
import Chunk from './Chunk'
import ChunkSlots from './ChunksSlots'
import { DirtyFlag } from './ChunkCollection';

type GlslVersion = '100' | '300 es'


class ShaderVersion extends Chunk {

  version: GlslVersion;

  constructor( v : GlslVersion = '100' ) {
    super(true, false);
    this.version = v;
  }


  set( v : GlslVersion ) {
    this.version = v;
    this.invalidateCode();
  }


  _getHash() {
    return 'v' + this.version;
  }


  _genCode( slots : ChunkSlots ) {
    var s = `#version ${this.version}`;
    slots.add('version', s);
  }

}

export default ShaderVersion
