import IblBase from './IblBase';
import LightType from './LightType';
export default class Ibl extends IblBase {
    constructor(env, sh) {
        super(sh);
        this._type = LightType.IBL;
        this.env = env;
    }
    setupProgram(prg) {
        super.setupProgram(prg);
        if (prg.tEnv)
            prg.tEnv(this.env);
    }
}
