const Speakeasy = require('speakeasy');
async function generateTotp(key,secr){
  'use strict';
const secret = {
    secret: secr,
    encoding: 'base32',
    algorithm: 'sha1'
};
return `Authorization: GFAPI ${key}:${Speakeasy.totp(secret)}`
}
module.exports= {
  generateTotp
}