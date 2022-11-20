import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { randomUUID } from 'crypto';

export class AquireCertificateDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Find cert with GET /users',
    example: randomUUID(),
  })
  userId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Find cert with GET /certificates/available',
    example: randomUUID(),
  })
  certificateId: string;
}
