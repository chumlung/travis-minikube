import {inject, service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  Response,
  response,
  RestBindings
} from '@loopback/rest';
import {Course} from '../models';
import {CourseRepository} from '../repositories';
import {QueueService} from '../services';

export class CourseController {
  constructor(
    @repository(CourseRepository)
    public courseRepository: CourseRepository,
    @service(QueueService)
    public queueService: QueueService,
    @inject(RestBindings.Http.RESPONSE) private res: Response,
  ) {}

  @post('courses/')
  @response(200, {
    description: 'Course model instance',
    content: {'application/json': {schema: getModelSchemaRef(Course)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Course, {
            title: 'NewCourse',
            exclude: ['id'],
          }),
        },
      },
    })
    course: Omit<Course, 'id'>,
  ) {
    const newCourse = await this.courseRepository.create(course);
    this.res.status(200).send(newCourse);

    this.queueService.sendMessage(
      JSON.stringify(newCourse),
      'platform.event.course_created',
    );
    return;
  }

  @get('courses/count')
  @response(200, {
    description: 'Course model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Course) where?: Where<Course>): Promise<Count> {
    return this.courseRepository.count(where);
  }

  @get('courses/')
  @response(200, {
    description: 'Array of Course model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Course, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Course) filter?: Filter<Course>): Promise<Course[]> {
    return this.courseRepository.find(filter);
  }

  @patch('courses/')
  @response(200, {
    description: 'Course PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Course, {partial: true}),
        },
      },
    })
    course: Course,
    @param.where(Course) where?: Where<Course>,
  ) {

    const updatedCourse = await this.courseRepository.updateAll(course, where);
    this.res.status(200).send(updatedCourse);

    this.queueService.sendMessage(
      JSON.stringify(updatedCourse),
      'platform.event.course_created',
    );
    return;
  }

  @get('courses/{id}')
  @response(200, {
    description: 'Course model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Course, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Course, {exclude: 'where'})
    filter?: FilterExcludingWhere<Course>,
  ): Promise<Course> {
    return this.courseRepository.findById(id, filter);
  }

  @patch('courses/{id}')
  @response(204, {
    description: 'Course PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Course, {partial: true}),
        },
      },
    })
    course: Course,
  ): Promise<void> {
    await this.courseRepository.updateById(id, course);
  }

  @put('courses/{id}')
  @response(204, {
    description: 'Course PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() course: Course,
  ): Promise<void> {
    await this.courseRepository.replaceById(id, course);
  }

  @del('courses/{id}')
  @response(204, {
    description: 'Course DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.courseRepository.deleteById(id);
  }
}
