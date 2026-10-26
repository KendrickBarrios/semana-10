package org.kkbp.react.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Solicitud {

    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    @NotNull(message = "La prioridad es obligatoria y debe ser: Alta, Media o Baja")
    private Prioridad prioridad;

    @NotBlank(message = "El estado es obligatorio")
    @Pattern(
            regexp = "^(Pendiente|En proceso|Resuelta)$",
            message = "El estado solo puede ser: Pendiente, En proceso o Resuelta"
    )
    private String estado;
}
