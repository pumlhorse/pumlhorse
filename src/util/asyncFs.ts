
import * as fs from 'fs';
import * as YAML from 'pumlhorse-yamljs';
import * as recursiveReaddir from 'recursive-readdir';

export { readAsYaml, readFile, readAsJson, readdir, stat };

function readAsYaml(path): Promise<Object> {
    return new Promise(function (resolve, reject) {
        try{
            const result = YAML.parseFile(path);
            resolve(result);
        }
        catch (e) {
            reject(e);
        }
    });
}

async function readAsJson(path): Promise<Object> {
    const fileContents = await readFile(path);
    return JSON.parse(fileContents);
}

function readFile(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });
}

function readdir(path: string, recursive: boolean): Promise<string[]> {
    if (recursive) {
        return new Promise((resolve, reject) => {
            recursiveReaddir(path, (err, data) => {
                if (err) reject(err);
                resolve(data);
            });
        });
    }

    return new Promise((resolve, reject) => {
        fs.readdir(path, (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });
}

function stat(path): Promise<IStat> {
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });
}

interface IStat {
    isFile(): boolean;
    isDirectory(): boolean;
}