
import Chunk from './Chunk'
import ChunkSlots from './ChunksSlots'

import {GlslPrecision} from './interfaces/GlslPrecision'
import { hashString } from './Hash';


/**
manage float precision qualifier only
**/
class ShaderPrecision extends Chunk {

  private fprecision: GlslPrecision;

  constructor( p : GlslPrecision = 'mediump' ) {

    super(true, false);

    this.fprecision = p;
  }




  set(p:GlslPrecision) {
    this.fprecision = p;
  }


  _getHash() {
    return hashString(this.fprecision);
  }


  _genCode( slots  :ChunkSlots ) {
    const s = `precision ${this.fprecision} float;\n`;
    slots.add('precision', s);
  }

}

export default ShaderPrecision
