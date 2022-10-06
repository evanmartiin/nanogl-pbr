
import { vec3 } from 'gl-matrix';
import Program from 'nanogl/program';
import { Texture } from 'nanogl/texture-base';
import { HdrEncoding, IblFormat, ShFormat } from './IblModel';
import Light from './Light';
import LightType from './LightType';


export type IblBoxProjection = {
  center: vec3;
  min: vec3;
  max: vec3;
}

export default class Ibl extends Light {

  readonly _type = LightType.IBL;

  /**
   * The type of Mapping of the env map
   */
  iblFormat : IblFormat = 'OCTA';

  /**
   * Encoding used to storee HDR values in the env map
   */
  hdrEncoding: HdrEncoding = "RGBM";


  shFormat: ShFormat = "SH9";

  /**
   * number of available mip levels in the env map
   * In pmrem, the lower mip levels can be left unused (black) to keep definition in high roughness values
   */
  mipLevels = 5;

  /**
   * enable rotation of the IBL
   */
  enableRotation = false

  /**
   * enable box projection for reflection
   */
  enableBoxProjection = false

  /**
   * The size of the box projection
   */
  readonly boxProjectionSize = vec3.fromValues(1, 1, 1)
  
  /**
   * offset the center of the projection relative to the world space position of the light's node
   */
  readonly boxProjectionOffset = vec3.fromValues(0, 0, 0)

  


  constructor( public env? : Texture, public sh? : ArrayLike<number> ){
    super();
  }

  setupProgram( prg : Program ){
    prg.uSHCoeffs?.(  this.sh  );
    prg.tEnv?.(       this.env );
  }

  
  static convert( sh : ArrayLike<number>, expo : number = 1.0 ){

    const SqrtPI = Math.sqrt(Math.PI);
    const C0 = 1.0 / (2 * SqrtPI);
    const C1 = Math.sqrt(3)  / (3 * SqrtPI);
    const C2 = Math.sqrt(15) / (8 * SqrtPI);
    const C3 = Math.sqrt(5)  / (16 * SqrtPI);
    const C4 = 0.5 * C2;
  
    const res = new Float32Array(7 * 4);
  
    // R
    res[0]  = expo * (    C1 * sh[2 * 3 + 0] );
    res[1]  = expo * (  - C1 * sh[1 * 3 + 0] );
    res[2]  = expo * (  - C1 * sh[3 * 3 + 0] );
    res[3]  = expo * (    C0 * sh[0 * 3 + 0] - C3 * sh[6 * 3 + 0] );
  
    //  G
    res[4]  = expo * (    C1 * sh[2 * 3 + 1] );
    res[5]  = expo * (  - C1 * sh[1 * 3 + 1] );
    res[6]  = expo * (  - C1 * sh[3 * 3 + 1] );
    res[7]  = expo * (    C0 * sh[0 * 3 + 1] - C3 * sh[6 * 3 + 1] );
  
    //  B
    res[8]  = expo * (    C1 * sh[2 * 3 + 2] );
    res[9]  = expo * (  - C1 * sh[1 * 3 + 2] );
    res[10] = expo * (  - C1 * sh[3 * 3 + 2] );
    res[11] = expo * (    C0 * sh[0 * 3 + 2] - C3 * sh[6 * 3 + 2] );
  
    res[12] = expo * (    C2 * sh[4 * 3 + 0] );
    res[13] = expo * (  - C2 * sh[5 * 3 + 0] );
    res[14] = expo * (3 * C3 * sh[6 * 3 + 0] );
    res[15] = expo * (  - C2 * sh[7 * 3 + 0] );
  
    res[16] = expo * (    C2 * sh[4 * 3 + 1] );
    res[17] = expo * (  - C2 * sh[5 * 3 + 1] );
    res[18] = expo * (3 * C3 * sh[6 * 3 + 1] );
    res[19] = expo * (  - C2 * sh[7 * 3 + 1] );
  
    res[20] = expo * (    C2 * sh[4 * 3 + 2] );
    res[21] = expo * (  - C2 * sh[5 * 3 + 2] );
    res[22] = expo * (3 * C3 * sh[6 * 3 + 2] );
    res[23] = expo * (  - C2 * sh[7 * 3 + 2] );
  
    res[24] = expo * (    C4 * sh[8 * 3 + 0] );
    res[25] = expo * (    C4 * sh[8 * 3 + 1] );
    res[26] = expo * (    C4 * sh[8 * 3 + 2] );
    res[27] = expo * (    1 );
  
    return res;
  }

}

