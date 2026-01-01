import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AuthResponseDto {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken?: string;

  @Expose()
  expiresIn: number;

  @Expose()
  tokenType: string = 'Bearer';

  @Expose()
  user: {
    id: string;
    name: string;
    email: string;
  };
}