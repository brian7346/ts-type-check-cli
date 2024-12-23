#!/usr/bin/env node
import { program } from 'commander';
import { checkTypes } from './checker';

program
  .name('ts-check')
  .description('TypeScript type checker CLI')
  .version('1.0.0')
  .argument('<file>', 'TypeScript file to check')
  .option('-p, --project <path>', 'Path to tsconfig.json')
  .action(async (file, options) => {
    try {
      await checkTypes(file, {
        project: options.project,
        watch: true 
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error('Произошла неизвестная ошибка');
      }
      process.exit(1);
    }
  });

program.parse();