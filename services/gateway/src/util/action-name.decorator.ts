import { SetMetadata } from '@nestjs/common';

export const ActionName = (name: string) => SetMetadata('actionName', name);