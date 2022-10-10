import { vec3 } from 'gl-matrix';
import { HdrEncoding, IblFormat, ShFormat } from './IblModel';
import Light from './Light';
import LightType from './LightType';
export declare type IblBoxProjection = {
    center: vec3;
    min: vec3;
    max: vec3;
};
export default class Ibl extends Light {
    env?: import("nanogl/texture-cube").default | import("nanogl/texture-2d").default | undefined;
    sh?: ArrayLike<number> | undefined;
    readonly _type = LightType.IBL;
    iblFormat: IblFormat;
    hdrEncoding: HdrEncoding;
    shFormat: ShFormat;
    mipLevels: number;
    enableRotation: boolean;
    enableBoxProjection: boolean;
    intensity: number;
    ambiantIntensity: number;
    specularIntensity: number;
    readonly boxProjectionSize: vec3;
    readonly boxProjectionOffset: vec3;
    constructor(env?: import("nanogl/texture-cube").default | import("nanogl/texture-2d").default | undefined, sh?: ArrayLike<number> | undefined);
}
