import { ModuleRepository } from './Modules';

export var pumlhorse = {
    module: ModuleRepository.addModule,
    //filter: filters.getFilterBuilder
};

global['pumlhorse'] = pumlhorse;