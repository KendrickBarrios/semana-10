package org.kkbp.react.controller;

import jakarta.validation.Valid;
import org.kkbp.react.dto.Solicitud;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api/solicitudes")
@CrossOrigin(origins = "http://localhost:5173")
public class SolicitudController {

    private final List<Map<String, Object>> solicitudes = new CopyOnWriteArrayList<>(List.of(
            new HashMap<>(Map.of("id", 1, "titulo", "Equipo no enciende", "prioridad", "Alta", "estado", "Pendiente")),
            new HashMap<>(Map.of("id", 2, "titulo", "Instalar software", "prioridad", "Media", "estado", "En proceso"))
    ));

    @GetMapping
    public List<Map<String, Object>> listar() {
        return solicitudes;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> agregar(@RequestBody @Valid Solicitud nuevaSolicitud) {
        int nuevoId = solicitudes.size() + 1;

        Map<String, Object> registro = new HashMap<>();
        registro.put("id", nuevoId);
        registro.put("titulo", nuevaSolicitud.getTitulo());
        registro.put("prioridad", nuevaSolicitud.getPrioridad().name());
        registro.put("estado", nuevaSolicitud.getEstado());

        solicitudes.add(registro);

        return ResponseEntity.status(HttpStatus.CREATED).body(registro);
    }
}
