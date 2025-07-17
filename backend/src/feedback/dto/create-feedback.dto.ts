import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  category?: string;
}
