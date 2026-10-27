export function modulePayload(fields, form, editing = false) {
  const payload = {};
  for (const field of fields) {
    if (field.readOnly) continue;
    const value = form[field.name];
    if (!field.required && (value === "" || value === undefined) && (field.optionsEndpoint || field.options || ["date", "datetime-local"].includes(field.type))) {
      if (editing && (field.optionsEndpoint || ["date", "datetime-local"].includes(field.type))) payload[field.name] = null;
      continue;
    }
    if (field.optionsEndpoint && value && typeof value === "object") payload[field.name] = value._id || value.id;
    else if (field.type === "number") payload[field.name] = value === "" ? 0 : Number(value);
    else if (field.type === "array" || ["members", "participants"].includes(field.name)) payload[field.name] = String(value || "").split(",").map(item => item.trim()).filter(Boolean);
    else payload[field.name] = value;
  }
  return payload;
}
