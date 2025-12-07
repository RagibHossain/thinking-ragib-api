// Type definitions for passport-github2
declare module 'passport-github2' {
  import { Strategy as PassportStrategy } from 'passport';
  import { Request } from 'express';

  export interface Profile {
    id: string;
    username: string;
    displayName: string;
    emails?: Array<{ value: string; type?: string }>;
    photos?: Array<{ value: string }>;
    provider: string;
    _raw: string;
    _json: any;
  }

  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string | string[];
    userAgent?: string;
    [key: string]: any;
  }

  export interface VerifyFunction {
    (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (error: any, user?: any, info?: any) => void
    ): void;
  }

  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: VerifyFunction);
    name: string;
  }
}

