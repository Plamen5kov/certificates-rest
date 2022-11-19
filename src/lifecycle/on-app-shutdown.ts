import { Logger, Injectable, OnModuleDestroy } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ShutdownService implements OnModuleDestroy {
  private readonly logger = new Logger(ShutdownService.name);

  constructor(
    private dataSource: DataSource,
    private readonly signal: string,
  ) {}

  async onModuleDestroy() {
    this.logger.warn(this.signal);
    await this.closeDBConnection();
  }

  async closeDBConnection() {
    if (this.dataSource.isInitialized) {
      try {
        await this.dataSource.destroy();
        this.logger.log('DB conn closed');
      } catch (err) {
        this.logger.error('Error clossing conn to DB, ', err);
      }
    } else {
      this.logger.log('DB conn already closed.');
    }
  }
}
