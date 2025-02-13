#!/usr/bin/env node

import { Command } from 'commander';
import { bench } from './commands/index';

const program = new Command();

program.version('1.0.0').description('Magic Inspector API CLI');

program.addCommand(bench);

program.parse(process.argv);
