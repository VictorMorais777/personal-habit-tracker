package com.example.site_web_completo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    @Autowired
    private ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${app.mail.enabled:false}")
    private boolean enabled;

    @Value("${app.mail.from:no-reply@saturn.local}")
    private String from;

    public void sendPasswordReset(String to, String link) {
        if (!enabled) {
            log.info("[DEV] Password reset link for {}: {}", to, link);
            return;
        }

        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender == null) {
            log.error("app.mail.enabled=true, but no SMTP server is configured (spring.mail.host)");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject("Saturn Habit Tracker: redefinição de senha");
            message.setText(
                    "Olá!\n\n"
                            + "Recebemos um pedido para redefinir a senha da sua conta. "
                            + "Use o link abaixo, válido por 30 minutos:\n\n"
                            + link + "\n\n"
                            + "Se não foi você, ignore este email: sua senha continua a mesma.\n"
            );
            sender.send(message);
        } catch (Exception e) {
            log.error("Failed to send password reset email", e);
        }
    }
}