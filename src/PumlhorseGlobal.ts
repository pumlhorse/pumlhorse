import { ModuleRepository } from './script/Modules';
import { getFilterBuilder } from './profile/filters';

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