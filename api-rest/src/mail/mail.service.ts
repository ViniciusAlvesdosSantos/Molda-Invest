import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    
    if (!apiKey) {
      this.logger.error('❌ RESEND_API_KEY não encontrada no arquivo .env');
      throw new Error('RESEND_API_KEY não configurada');
    }

    this.resend = new Resend(apiKey);
    this.logger.log('✅ MailService inicializado com sucesso');
  }

  /**
   * Enviar email de verificação (link)
   */
  async sendVerificationEmail(to: string, verificationUrl: string) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'Molda Invest <onboarding@resend.dev>', // ✅ USAR DOMÍNIO DE TESTE
        to,
        subject: 'Verifique seu email - Molda Invest',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #6366f1; margin: 0;">🚀 Molda Invest</h1>
            </div>
            
            <div style="background: #f8fafc; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
              <h2 style="color: #1e293b; margin-top: 0;">Bem-vindo ao Molda Invest!</h2>
              <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                Estamos felizes em ter você conosco. Para começar a usar sua conta, 
                precisamos verificar seu email.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="display: inline-block; background-color: #6366f1; color: white; 
                        padding: 14px 32px; text-decoration: none; border-radius: 8px; 
                        font-weight: bold; font-size: 16px;">
                ✅ Verificar Meu Email
              </a>
            </div>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                ⚠️ Este link expira em <strong>24 horas</strong>
              </p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px;">
                Ou copie e cole este link no navegador:
              </p>
              <p style="background: #f1f5f9; padding: 10px; border-radius: 4px; 
                        word-break: break-all; font-size: 12px; color: #475569;">
                ${verificationUrl}
              </p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                Se você não criou esta conta, ignore este email.
              </p>
            </div>
          </div>
        `,
      });

      if (error) {
        this.logger.error('❌ Erro ao enviar email de verificação:');
        this.logger.error(error);
        throw new Error('Falha ao enviar email de verificação');
      }

      this.logger.log(`✅ Email de verificação enviado para: ${to}`);
      return data;
    } catch (error) {
      this.logger.error('❌ Erro ao enviar email:');
      this.logger.error(error);
      throw error;
    }
  }

  /**
   * Enviar código OTP para login
   */
  async sendLoginOtp(to: string, otpCode: string) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'Molda Invest <onboarding@resend.dev>', // ✅ USAR DOMÍNIO DE TESTE
        to,
        subject: 'Seu código de login - Molda Invest',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #6366f1; margin: 0;">🔐 Molda Invest</h1>
            </div>
            
            <div style="background: #f8fafc; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
              <h2 style="color: #1e293b; margin-top: 0;">Código de Acesso</h2>
              <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                Use o código abaixo para fazer login na sua conta:
              </p>
            </div>

            <div style="background: #f1f5f9; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
              <div style="font-size: 48px; font-weight: bold; letter-spacing: 12px; color: #1e293b; font-family: monospace;">
                ${otpCode}
              </div>
            </div>

            <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="color: #991b1b; margin: 0; font-size: 14px;">
                ⚠️ Este código expira em <strong>10 minutos</strong>
              </p>
            </div>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                🔒 Nunca compartilhe este código com ninguém
              </p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                Se você não solicitou este código, ignore este email.
              </p>
            </div>
          </div>
        `,
      });

      if (error) {
        this.logger.error('❌ Erro ao enviar OTP:');
        this.logger.error(error);
        throw new Error('Falha ao enviar código de verificação');
      }

      this.logger.log(`✅ OTP enviado para: ${to}`);
      return data;
    } catch (error) {
      this.logger.error('❌ Erro ao enviar OTP:');
      this.logger.error(error);
      throw error;
    }
  }

  /**
   * 🧪 Testar envio de email (desenvolvimento)
   */
  async testEmail(to: string) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'Molda Invest <onboarding@resend.dev>', // ✅ USAR DOMÍNIO DE TESTE
        to,
        subject: '🧪 Email de Teste - Molda Invest',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #10b981;">✅ Email Funcionando!</h1>
            <p style="font-size: 16px; color: #475569;">
              Se você recebeu este email, a integração com Resend está configurada corretamente.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            <div style="background: #f1f5f9; padding: 15px; border-radius: 4px;">
              <p style="margin: 5px 0; font-size: 14px; color: #64748b;">
                <strong>Ambiente:</strong> ${this.configService.get('NODE_ENV', 'development')}
              </p>
              <p style="margin: 5px 0; font-size: 14px; color: #64748b;">
                <strong>Timestamp:</strong> ${new Date().toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        `,
      });

      if (error) {
        this.logger.error('❌ Erro no teste de email:');
        this.logger.error(error);
        throw new Error('Falha no teste de email');
      }

      this.logger.log(`✅ Email de teste enviado para: ${to}`);
      return data;
    } catch (error) {
      this.logger.error('❌ Erro no teste de email:');
      this.logger.error(error);
      throw error;
    }
  }
}
