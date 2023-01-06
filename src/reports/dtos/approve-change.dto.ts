import { IsBoolean } from 'class-validator';

export class ApproveChangeDto {
  @IsBoolean()
  approved: boolean;
}
