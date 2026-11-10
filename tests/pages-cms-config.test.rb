require "yaml"
require "json"

ROOT = File.expand_path("..", __dir__)
CONFIG = YAML.safe_load_file(File.join(ROOT, ".pages.yml"), aliases: false)
DATA = JSON.parse(File.read(File.join(ROOT, "data/evento.json")))
TYPES = %w[string text date number boolean select object].freeze
FIELD_KEYS = %w[name label type component required pattern hidden readonly description options default list fields].freeze

def check(condition, message)
  raise message unless condition
end

def resolve(field)
  component = field["component"]
  base = component ? CONFIG.fetch("components").fetch(component) : {}
  base.merge(field.reject { |key, _| key == "component" })
end

def inspect_fields(fields)
  check(fields.is_a?(Array) && !fields.empty?, "Faltan campos estructurados")
  check(fields.map { |field| field.fetch("name") }.uniq.length == fields.length, "Nombres de campos duplicados")
  fields.each do |definition|
    check((definition.keys - FIELD_KEYS).empty?, "Claves no admitidas: #{definition}")
    check(definition.key?("type") != definition.key?("component"), "Usa type o component, no ambos")
    field = resolve(definition)
    check(TYPES.include?(field["type"]), "Tipo no admitido: #{field}")
    check(field["label"].is_a?(String) && !field["label"].empty?, "Falta etiqueta")
    check(field["name"].match?(/\A[a-zA-Z0-9_-]+\z/), "Nombre de campo no admitido")
    %w[required readonly hidden].each do |key|
      check([true, false].include?(field[key]), "#{key} no es boolean") if field.key?(key)
    end
    pattern = field["pattern"]
    if pattern
      regex = Regexp.new(pattern.is_a?(Hash) ? pattern.fetch("regex") : pattern)
      check(regex.match?(""), "El patrón opcional debe permitir dejar #{field['name']} vacío") unless field["required"]
    end
    if field["list"].is_a?(Hash)
      check((field["list"].keys - %w[min max collapsible]).empty?, "Opciones de lista no admitidas")
      check(field["list"].key?("collapsible"), "Falta collapsible en la lista")
    end
    inspect_fields(field.fetch("fields")) if field["type"] == "object"
    if field["type"] == "select"
      check(!field.fetch("options").fetch("values").empty?, "Select sin opciones")
    end
  end
end

def check_content(fields, object)
  check(object.is_a?(Hash), "El contenido debe ser un objeto")
  check((object.keys - fields.map { |field| field["name"] }).empty?, "Hay datos reales sin campo en el formulario")
  fields.each do |definition|
    field = resolve(definition)
    value = object[field["name"]]
    next if value.nil? && !field["required"]
    values = field["list"] ? value : [value]
    check(values.is_a?(Array), "La lista #{field['name']} no es un array")
    values.each do |item|
      case field["type"]
      when "object"
        check_content(field.fetch("fields"), item)
      when "boolean"
        check([true, false].include?(item), "#{field['name']} no es boolean")
      when "number"
        check(item.is_a?(Numeric), "#{field['name']} no es un número")
      when "select"
        options = field.fetch("options").fetch("values").map { |option| option.is_a?(Hash) ? option.fetch("name") : option }
        check(options.include?(item), "#{field['name']} no está en las opciones")
      else
        check(item.is_a?(String) && !item.strip.empty?, "#{field['name']} no es texto")
        pattern = field["pattern"]
        pattern = pattern.fetch("regex") if pattern.is_a?(Hash)
        check(Regexp.new(pattern).match?(item), "#{field['name']} no cumple el patrón") if pattern
      end
    end
  end
end

check((CONFIG.keys - %w[content components settings]).empty?, "Claves raíz no esperadas")
check(CONFIG.fetch("content").length == 1, "Debe editarse un único archivo, no copias por sección")
entry = CONFIG.fetch("content").first
check(entry.values_at("type", "path", "format") == ["file", "data/evento.json", "json"], "Destino incorrecto")
check(entry.fetch("operations") == { "create" => false, "rename" => false, "delete" => false }, "El JSON debe estar protegido")
check(CONFIG.dig("settings", "content", "merge") == true, "No deben perderse claves ajenas al formulario")
fields = entry.fetch("fields")
inspect_fields(fields)
check_content(fields, DATA)

days = resolve(fields.find { |field| field["name"] == "days" })
check(days["list"].values_at("min", "max") == [3, 3], "Deben mantenerse tres jornadas")
day_fields = days.fetch("fields")
check(day_fields.find { |field| field["name"] == "date" }["readonly"], "La fecha de jornada debe estar protegida")
activities = day_fields.find { |field| field["name"] == "activities" }.fetch("fields")
start = activities.find { |field| field["name"] == "start" }
check(start.values_at("type", "default") == ["date", ""], "No debe inventarse una hora por defecto")
check(start.dig("options", "time") == true, "Falta selector de hora")
check(start.dig("options", "format") == "yyyy-MM-dd'T'HH:mm':00+02:00'", "El desfase debe ser literal, no el del navegador")
check(activities.find { |field| field["name"] == "locationId" }["type"] == "string", "Deben admitirse nuevos IDs de lugar")
check(activities.find { |field| field["name"] == "cancelled" }["default"] == false, "Una actividad nueva no está cancelada")
check(CONFIG.dig("components", "provisional", "default") == true, "Una actividad nueva es provisional")
expected_disciplines = ["Natación", "Ciclismo", "Running", "Triatlón", "Comida", "Descanso", "Organización"]
check(CONFIG.dig("components", "disciplina", "options", "values") == expected_disciplines, "Disciplinas incompatibles")
activity_discipline = resolve(activities.find { |field| field["name"] == "discipline" })
activity_options = activity_discipline.fetch("options").fetch("values")
check(activity_options.first == { "name" => "", "label" => "Pendiente de confirmar" } &&
  activity_options.drop(1) == expected_disciplines, "La disciplina de actividad debe poder volver a pendiente")
room_fields = fields.find { |field| field["name"] == "rooms" }.fetch("fields")
check_content(room_fields, {
  "id" => "solo-fixture", "name" => "Solo prueba", "capacity" => 2,
  "occupants" => ["ALIAS-01"], "notes" => nil, "provisional" => false
})
%w[rooms routes locations].each do |name|
  check(!fields.find { |field| field["name"] == name }["required"], "#{name} debe admitir una lista vacía")
end
%w[distanceKm elevationM].each do |name|
  field = fields.find { |item| item["name"] == "routes" }.fetch("fields").find { |item| item["name"] == name }
  check(field["default"] == "" && field.dig("options", "min") == 0 && field.dig("options", "step") == "any",
    "#{name} debe admitir pendientes, cero y decimales")
end
puts "Pages CMS: YAML válido, estructura y datos reales compatibles; campos, listas, opciones y defaults comprobados."
