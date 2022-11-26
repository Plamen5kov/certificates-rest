import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  UseGuards,
  ParseUUIDPipe,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TransferCertificateDto } from './dto/transfer-certificate.dto';

@Controller('certificates')
@ApiTags('certificates')
@ApiBearerAuth('JWT')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post()
  create(@Body() createCertificateDto: CreateCertificateDto) {
    return this.certificatesService.create(createCertificateDto);
  }

  @Get('available')
  findAllAvailable() {
    return this.certificatesService.findAll({ available: true });
  }

  @Post('/aquireAvailable/:certId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @HttpCode(HttpStatus.OK)
  aquireOwnership(
    @Request() req,
    @Param('certId', ParseUUIDPipe) certId: string,
  ) {
    return this.certificatesService.aquireCertificate({
      userId: req.user.userId,
      certificateId: certId,
    });
  }

  @Post('/transferOwn')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  transferOwnership(
    @Request() req,
    @Body() transferCertificateInfo: TransferCertificateDto,
  ) {
    return this.certificatesService.transferCertificate(
      req.user.userId,
      transferCertificateInfo,
    );
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  findOwned(@Request() req) {
    return this.certificatesService.findAll({ userId: req.user.userId });
  }
}
