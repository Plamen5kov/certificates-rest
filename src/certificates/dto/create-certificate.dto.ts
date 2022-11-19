import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCertificateDto {
  @IsNotEmpty()
  @IsString()
  country: string;
}
