import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCertificateDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Bulgaria',
  })
  country: string;
}
