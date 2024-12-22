#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';

function getAllTypeScriptFiles(dirPath: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllTypeScriptFiles(filePath, fileList);
        } else if (
            (file.endsWith('.ts') || file.endsWith('.tsx')) && 
            file.includes('problem')
        ) {
            const relativePath = path.relative('src', filePath);
            fileList.push(relativePath);
        }
    });

    return fileList.sort();
}

function updatePackageJson() {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    const tsFiles = getAllTypeScriptFiles('src');
    const scripts = { ...packageJson.scripts };

    tsFiles.forEach((file, index) => {
        const paddedIndex = String(index + 1).padStart(2, '0');
        const scriptName = `check-types-${paddedIndex}`;
        scripts[scriptName] = `ts-check ${file}`;
    });

    scripts['check-types'] = `npm-run-all check-types-*`;

    packageJson.scripts = scripts;

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Скрипты проверки типов успешно добавлены в package.json');
}

updatePackageJson(); 