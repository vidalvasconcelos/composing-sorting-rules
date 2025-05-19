import eslint from '@eslint/js';
import { config, configs } from 'typescript-eslint';

export default config(
  eslint.configs.recommended,
  configs.strict,
  configs.stylistic,
);
