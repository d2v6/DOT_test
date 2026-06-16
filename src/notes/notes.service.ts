import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Note } from './notes.entity';
import { CreateNoteDto } from './dto/create-note.dto';

type NoteResponse = Pick<Note, 'id' | 'content'>;

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private notesRepository: Repository<Note>,
  ) {}

  async create(
    createNoteDto: CreateNoteDto,
    userId: number,
  ): Promise<NoteResponse> {
    const note = this.notesRepository.create({
      content: createNoteDto.content,
      user: { id: userId },
    });

    const savedNote = await this.notesRepository.save(note);

    return {
      id: savedNote.id,
      content: savedNote.content,
    };
  }

  findByUserId(userId: number): Promise<Note[]> {
    return this.notesRepository.find({
      where: { user: { id: userId } },
    });
  }
}
