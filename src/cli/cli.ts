import { IProfile } from '../profile/IProfile';
import { Profile } from '../profile/Profile';
import { CliOutput } from './CliOutput';
import * as path from 'path';
import * as commandLineArgs from 'command-line-args';
import * as _ from 'underscore';
import * as colors from 'colors';
import { App } from '../App';
import { IApp } from '../IApp';
import * as loggers from '../script/loggers';
import * as fs from '../util/asyncFs';

export async function run(args) {
    console.time('Total time')
    if (!args) args = []
    else args = args.slice(2)

    const profile = await buildProfile(args);
    if (profile != null) {
        try {
            const app = new App();
            configureLoggers();
            await app.runProfile(profile, new CliOutput());
        }
        catch (err) {
            logError(err);
        }
        finally
        {
            console.timeEnd('Total time');
        }
    } 
}

async function buildProfile(args: any[]): Promise<IProfile> {
    var cli = commandLineArgs([
        {
            name: 'filesOrDirs',
            defaultOption: true,
            multiple: true,
            type: String
        },
        {
            name: 'context',
            alias: 'c',
            multiple: true,
            type: String,
            defaultValue: []
        },
        {
            name: 'recursive',
            alias: 'r',
            type: Boolean
        },
        {
            name: 'sync',
            type: Boolean
        },
        {
            name: 'max-concurrent',
            type: Number
        },
        {
            name: 'profile',
            alias: 'p',
            type: String
        },
        {
            name: 'version',
            alias: 'v',
            type: Boolean
        }
    ])
    
    var argObj = cli.parse(args);
    
    if (argObj.version) {
        loggers.log('Pumlhorse: version ' + require('../../package.json').version)
        return null;
    }
    
    let profile: IProfile;
    if (argObj.profile == null) {
        profile = new Profile();
    }
    else {
        profile = await readProfileFile(argObj.profile);
    }
    
    if (profile.include == null && argObj.filesOrDirs == null) {
        profile.include = ['.'];
    }
    else {
        profile.include = combine(profile.include, argObj.filesOrDirs);
    }

    profile.contexts = combine(profile.contexts, argObj.context)
    profile.isRecursive = override(argObj.recursive, profile.isRecursive)
    profile.isSynchronous = override(argObj.sync, profile.isSynchronous)
    profile.maxConcurrentFiles = override(argObj['max-concurrent'], profile.maxConcurrentFiles)
                    
    return profile;
}

async function readProfileFile(filePath): Promise<IProfile> {
    if (!filePath.endsWith('.pumlprofile')) filePath += '.pumlprofile';
    
    var fullPath = path.resolve(filePath)

    let stat;
    try {
        stat = await fs.stat(fullPath);
    }
    catch (err) {
        throw new Error(`"${filePath}" does not exist`);
    }

    if (!stat.isFile()) {
        throw new Error(`"${filePath}" does not exist`);
    }
    
    const profile = <IProfile>(await fs.readAsYaml(fullPath));

    if (profile == null) { 
        return null;
    }
            
    //Make files relative to profile path
    profile.include = makeRelative(filePath, profile.include)
    profile.modules = makeModulesRelative(filePath, profile.modules)
    profile.filters = makeRelative(filePath, profile.filters)
    profile.contexts = makeRelative(filePath, profile.contexts)
    return profile;
}

function combine(arr1, arr2) {
    if (!arr2) return arr1
    if (!arr1) return arr2
    
    return arr1.concat(arr2)
}

function override(overrideValue, currentValue) {
    return overrideValue != null && overrideValue != undefined 
        ? overrideValue
        : currentValue;
}

function makeRelative(filePath: string, array) {
    if (array == null) return array;
    
    return array.map(m => makeRelativePath(filePath, m));
}

function makeModulesRelative(filePath: string, modules: any) {
    if (modules == null) return modules;

    return modules.map((m) => { 
        return {
            name: m.name,
            path: makeRelativePath(filePath, m.path)
        };
    })
}

function makeRelativePath(filePath: string, filename: string) {
    return path.resolve(path.dirname(filePath), filename.toString())
}

function setColor(args, colorFunc) {
    args[0] = colorFunc(args[0])
    return args
}

function configureLoggers() {
    loggers.setLoggers({
        log: function () { console.log.apply(console, arguments) },
        warn: function () { console.warn.apply(console, setColor(arguments, colors.yellow)) },
        error: function () { console.error.apply(console, setColor(arguments, colors.red)) }
    });
}

function logError(err) {
    loggers.error(err.message ? err.message : err)
    throw err
}