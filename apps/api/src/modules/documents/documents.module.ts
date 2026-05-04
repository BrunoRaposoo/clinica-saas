import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { PrismaModule } from '../../common/prisma.module';
import { LocalStorageProvider } from './storage/local-storage.provider';

@Module({
  imports: [PrismaModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, LocalStorageProvider],
  exports: [DocumentsService],
})
export class DocumentsModule {}