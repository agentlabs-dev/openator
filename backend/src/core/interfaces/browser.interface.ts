import { Page } from 'playwright';
import { VariableString } from '../entities/variable-string';

export type Coordinates = {
  x: number;
  y: number;
};

export interface Browser {
  close(): Promise<void>;
  launch(url: string): Promise<void>;
  getStablePage(): Promise<Page>;
  getPage(): Page;
  getPageUrl(): string;
  mouseClick(x: number, y: number): Promise<void>;
  fillInput(text: VariableString, coordinates: Coordinates): Promise<void>;
  scrollDown(): Promise<void>;
  scrollUp(): Promise<void>;
  goToUrl(url: string): Promise<void>;
}
