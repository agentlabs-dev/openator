#!/usr/bin/env node

import { Command } from 'commander';
import { bench, benchv2 } from './commands/index';

const program = new Command();

program.version('1.0.0').description('Magic Inspector API CLI');

program.addCommand(bench);
program.addCommand(benchv2);

program.parse(process.argv);
