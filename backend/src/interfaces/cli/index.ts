#!/usr/bin/env node

import { Command } from 'commander';
import { startTest } from './commands/index';

const program = new Command();

program.version('1.0.0').description('Magic Inspector API CLI');

program.addCommand(startTest);

program.parse(process.argv);
