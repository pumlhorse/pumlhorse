import { ModuleRepository } from './script/Modules';
import { getFilterBuilder } from './Profile/filters';

class PumlhorseGlobal {
    module(name) {
        return ModuleRepository.addModule(name);
    }

    filter() {
        return getFilterBuilder();
    }
};

export const pumlhorse = new PumlhorseGlobal();

global['pumlhorse'] = pumlhorse;