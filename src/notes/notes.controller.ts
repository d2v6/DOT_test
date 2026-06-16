import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { NotesService } from './notes.service';
import { Note } from './notes.entity';
import { AuthGuard } from '../auth/auth.guard';
import { CreateNoteDto } from './dto/create-note.dto';

type NoteResponse = Pick<Note, 'id' | 'content'>;

type AuthenticatedRequest = Request & {
  user: {
    sub: number;
    username: string;
  };
};

@Controller('notes')
@UseGuards(AuthGuard)
export class NotesController {
  constructor(private noteService: NotesService) {}

  @Post()
  create(
    @Body() createNoteDto: CreateNoteDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<NoteResponse> {
    return this.noteService.create(createNoteDto, request.user.sub);
  }

  @Get()
  findByUser(@Req() request: AuthenticatedRequest): Promise<Note[]> {
    return this.noteService.findByUserId(request.user.sub);
  }
}
