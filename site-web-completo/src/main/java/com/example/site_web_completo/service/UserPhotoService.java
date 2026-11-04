package com.example.site_web_completo.service;

import com.example.site_web_completo.model.User;
import com.example.site_web_completo.model.UserPhoto;
import com.example.site_web_completo.repository.UserPhotoRepository;
import com.example.site_web_completo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageInputStream;
import javax.imageio.stream.ImageOutputStream;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.util.Iterator;

@Service
public class UserPhotoService {

    private static final long MAX_BYTES = 5L * 1024 * 1024;
    private static final long MAX_PIXELS = 25_000_000L;
    private static final int OUTPUT_SIZE = 256;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserPhotoRepository photoRepository;

    @Transactional
    public long save(String email, MultipartFile file) {
        User user = findUser(email);
        byte[] jpeg = toSquareJpeg(readImage(file));

        UserPhoto photo = photoRepository.findById(user.getId()).orElseGet(UserPhoto::new);
        photo.setUserId(user.getId());
        photo.setData(jpeg);
        photo.setUpdatedAt(Instant.now());
        photoRepository.save(photo);

        user.setPhotoVersion(photo.getUpdatedAt().toEpochMilli());
        userRepository.save(user);
        return user.getPhotoVersion();
    }

    @Transactional
    public void delete(String email) {
        User user = findUser(email);
        photoRepository.deleteById(user.getId());
        user.setPhotoVersion(null);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public UserPhoto get(Long userId) {
        return photoRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No photo"));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private BufferedImage readImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No file sent");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "File too large");
        }

        try (ImageInputStream input = ImageIO.createImageInputStream(file.getInputStream())) {
            Iterator<ImageReader> readers = input == null ? null : ImageIO.getImageReaders(input);
            if (readers == null || !readers.hasNext()) {
                throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Not a supported image");
            }

            ImageReader reader = readers.next();
            try {
                String format = reader.getFormatName().toLowerCase();
                if (!format.equals("jpeg") && !format.equals("png")) {
                    throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Only JPEG and PNG");
                }

                reader.setInput(input, true, true);
                long pixels = (long) reader.getWidth(0) * reader.getHeight(0);
                if (pixels < 1 || pixels > MAX_PIXELS) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image dimensions not accepted");
                }
                return reader.read(0);
            } finally {
                reader.dispose();
            }
        } catch (ResponseStatusException e) {
            throw e;
        } catch (IOException | RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not read the image");
        }
    }

    private byte[] toSquareJpeg(BufferedImage source) {
        int side = Math.min(source.getWidth(), source.getHeight());
        int x = (source.getWidth() - side) / 2;
        int y = (source.getHeight() - side) / 2;
        BufferedImage square = source.getSubimage(x, y, side, side);

        BufferedImage output = new BufferedImage(OUTPUT_SIZE, OUTPUT_SIZE, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = output.createGraphics();
        try {
            graphics.setColor(Color.WHITE);
            graphics.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
            graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            graphics.drawImage(square, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE, null);
        } finally {
            graphics.dispose();
        }

        ImageWriter writer = ImageIO.getImageWritersByFormatName("jpeg").next();
        try (ByteArrayOutputStream bytes = new ByteArrayOutputStream();
             ImageOutputStream stream = ImageIO.createImageOutputStream(bytes)) {
            ImageWriteParam params = writer.getDefaultWriteParam();
            params.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            params.setCompressionQuality(0.85f);
            writer.setOutput(stream);
            writer.write(null, new IIOImage(output, null, null), params);
            stream.flush();
            return bytes.toByteArray();
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not process the image");
        } finally {
            writer.dispose();
        }
    }
}