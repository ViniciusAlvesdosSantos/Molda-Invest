export class TokenPayloadDto {
  sub: string;      // User ID
  email: string;
  iat?: number;     // Issued at
  exp?: number;     // Expires at
}