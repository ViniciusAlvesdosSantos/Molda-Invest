import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { CreateAuthDto } from "./dto/create-auth.dto";
import * as bcrypt from 'bcrypt';
import { LoginDto } from "./dto/login.dto";
import { PrismaService } from "src/database/prisma.service";
import { CategoriesService } from "../categories-services/categories.service";

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private categoriesService: CategoriesService
    ) {}

    async register(data: CreateAuthDto) {
      const userExists = await this.prisma.user.findUnique({
        where: { email: data.email }
      })

      if (userExists) {
        throw new ConflictException("Email já cadastrado")
      }

      const hashedPassword = await bcrypt.hash(data.password, 10)

      const newUser = await this.prisma.$transaction(async (tx) => {
        // 1. Cria o usuário
        const user = await tx.user.create({
          data: {
            name: data.name,
            email: data.email,
            password: hashedPassword
          }
        })
        
        // 2. Cria as categorias DENTRO da transaction usando tx
        const defaultCategories = this.categoriesService.getDefaultCategories();
        
        await tx.category.createMany({
          data: defaultCategories.map(cat => ({
            name: cat.name,
            icon: cat.icon,
            type: cat.type,
            userId: user.id
          }))
        })
        
        return user
      })
      
      return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      }
    }

    async login(data: LoginDto) {
      const user = await this.prisma.user.findUnique({
        where: { email: data.email }
      })

      if (!user) {
        throw new UnauthorizedException("Credenciais Inválidas")
      }

      const isValidPassword = await bcrypt.compare(data.password, user.password)

      if (!isValidPassword) {
        throw new UnauthorizedException("Credenciais Inválidas")
      }

      const payload = { sub: user.id, email: user.email }

      return {
        access_token: await this.jwtService.signAsync(payload),
        user: { 
          id: user.id,
          name: user.name, 
          email: user.email 
        }
      }
    }
}