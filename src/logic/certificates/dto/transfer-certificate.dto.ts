import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { randomUUID } from 'crypto';

export class TransferCertificateDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Find cert with GET /users',
    example: randomUUID(),
  })
  toUserId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Find cert with GET /certificates/available',
    example: randomUUID(),
  })
  certificateId: string;
}
