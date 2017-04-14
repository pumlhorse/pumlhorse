import { ModuleRepository } from './script/Modules';
import { FilterBuilder } from './profile/filters';

class PumlhorseGlobal {
    module(name) {
        return ModuleRepository.addModule(name);
    }

    filter() {
        return new FilterBuilder();
    }
};

export const pumlhorse = new PumlhorseGlobal();

global['pumlhorse'] = pumlhorse;