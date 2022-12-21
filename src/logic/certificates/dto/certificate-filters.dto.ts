import { IsBoolean, IsString } from 'class-validator';

export class CertificateFilters {
  @IsBoolean()
  available?: boolean;

  @IsString()
  userId?: string;
}
