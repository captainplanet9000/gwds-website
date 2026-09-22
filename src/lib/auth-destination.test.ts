import { describe, expect, it } from 'vitest';
import { authDestination } from './auth-destination';
describe('customer authentication destinations',()=>{
  it('preserves the hosting journey and its query',()=>{expect(authDestination('/account/hosting?plan=solo')).toBe('/account/hosting?plan=solo');});
  it.each(['https://evil.example','//evil.example','/account/../../admin','/account/login','/account\\evil.example','javascript:alert(1)',null])('rejects an unsafe or unintended redirect %s',value=>{expect(authDestination(value)).toBe('/account');});
});
