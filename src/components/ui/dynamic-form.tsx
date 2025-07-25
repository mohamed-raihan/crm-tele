import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FieldType = 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'date';

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  validation?: z.ZodTypeAny;
  description?: string;
  showAddButton?: boolean;
  onAddClick?: () => void;
  className?: string;
}

export interface FormSection {
  title?: string;
  fields: FormField[];
  columns?: number;
  className?: string;
}

export interface DynamicFormProps {
  title?: string;
  sections: FormSection[];
  onSubmit: (data: any) => void;
  defaultValues?: Record<string, any>;
  initialData?: Record<string, any>;
  submitLabel?: string;
  showCancel?: boolean;
  onCancel?: () => void;
  className?: string;
  errors?: Record<string, string>; // Added errors prop
  validationSchema?: z.ZodSchema<any>; // Added validationSchema for completeness
  submitButtonProps?: { disabled?: boolean };
  submitButtonClassName?: string;
}

export function DynamicForm({
  title,
  sections,
  onSubmit,
  defaultValues = {},
  submitLabel = "Submit",
  showCancel = true,
  onCancel,
  className,
  errors,
  submitButtonProps,
  submitButtonClassName
}: DynamicFormProps) {
  // Create dynamic schema from fields
  // In DynamicForm component, update the createSchema function:

  const createSchema = () => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};

    sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.validation) {
          schemaFields[field.name] = field.validation;
        } else {
          let fieldSchema: z.ZodTypeAny = z.string();

          if (field.type === 'email') {
            if (field.required) {
              fieldSchema = z.string().min(1, `${field.label} is required`).email('Invalid email address');
            } else {
              fieldSchema = z.string().email('Invalid email address').optional();
            }
          } else if (field.type === 'date') {
            fieldSchema = z.date().optional();
          } else if (field.name === 'contact') {
            // Add specific validation for contact field
            if (field.required) {
              fieldSchema = z.string()
                .min(1, `${field.label} is required`)
                .regex(/^[0-9]{10}$/, 'Contact number must be exactly 10 digits');
            } else {
              fieldSchema = z.string()
                .regex(/^[0-9]{10}$/, 'Contact number must be exactly 10 digits')
                .optional();
            }
          } else {
            fieldSchema = z.string();
            if (field.required) {
              fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.label} is required`);
            } else {
              fieldSchema = fieldSchema.optional();
            }
          }

          schemaFields[field.name] = fieldSchema;
        }
      });
    });

    return z.object(schemaFields);
  };

  const form = useForm({
    resolver: zodResolver(createSchema()),
    defaultValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  // Sync parent errors prop to react-hook-form errors
  React.useEffect(() => {
    if (form && errors) {
      Object.entries(errors).forEach(([field, message]) => {
        form.setError(field as any, { type: "manual", message });
      });
    }
  }, [errors, form]);

  // Password visibility state per field
  const [passwordVisibility, setPasswordVisibility] = React.useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (fieldName: string) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  // Create a flat list of all field names in order
  const getAllFieldNames = () => {
    const fieldNames: string[] = [];
    sections.forEach(section => {
      section.fields.forEach(field => {
        fieldNames.push(field.name);
      });
    });
    return fieldNames;
  };

  // Function to move focus to next field
  const focusNextField = (currentFieldName: string) => {
    const allFieldNames = getAllFieldNames();
    const currentIndex = allFieldNames.indexOf(currentFieldName);
    
    if (currentIndex >= 0 && currentIndex < allFieldNames.length - 1) {
      const nextFieldName = allFieldNames[currentIndex + 1];
      
      // Small delay to ensure the DOM is ready
      setTimeout(() => {
        // Try to focus the next field - works for inputs, textareas, and select triggers
        const nextField = document.querySelector(`[name="${nextFieldName}"]`) as HTMLElement;
        if (nextField) {
          nextField.focus();
        } else {
          // For select fields, try to focus the trigger
          const selectTrigger = document.querySelector(`[data-field-name="${nextFieldName}"]`) as HTMLElement;
          if (selectTrigger) {
            selectTrigger.focus();
          }
        }
      }, 0);
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent, fieldName: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      focusNextField(fieldName);
    }
  };

  const renderField = (field: FormField) => {
    const isPasswordField = field.label.toLowerCase() === 'password';
    return (
      <FormField
        key={field.name}
        control={form.control}
        name={field.name}
        render={({ field: formField }) => (
          <FormItem className={field.className}>
            <FormLabel>{field.label}</FormLabel>
            <div className="flex gap-2">
              <FormControl className="flex-1">
                {isPasswordField ? (
                  <div className="relative">
                    <Input
                      placeholder={field.placeholder}
                      type={passwordVisibility[field.name] ? 'text' : 'password'}
                      {...formField}
                      onKeyDown={(e) => handleKeyDown(e, field.name)}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                      onClick={() => togglePasswordVisibility(field.name)}
                    >
                      {passwordVisibility[field.name] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                ) : field.type === 'textarea' ? (
                  <Textarea
                    placeholder={field.placeholder}
                    className="min-h-[100px]"
                    {...formField}
                    onKeyDown={(e) => handleKeyDown(e, field.name)}
                  />
                ) : field.type === 'select' ? (
                  <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                    <SelectTrigger 
                      data-field-name={field.name}
                      onKeyDown={(e) => handleKeyDown(e, field.name)}
                    >
                      <SelectValue placeholder={field.placeholder || "Select option"} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map(option => (
                        <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === 'date' ? (
                  // Use a native date input instead of custom calendar
                  <Input
                    type="date"
                    placeholder={field.placeholder}
                    value={formField.value ? format(formField.value, 'yyyy-MM-dd') : ''}
                    onChange={e => {
                      const val = e.target.value;
                      formField.onChange(val ? new Date(val) : undefined);
                    }}
                    className="text-center pr-0"
                    onKeyDown={(e) => handleKeyDown(e, field.name)}
                  />
                ) : (
                  <Input
                    placeholder={field.placeholder}
                    type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                    {...formField}
                    onInput={
                      field.name === "contact"
                        ? (e) => {
                          const input = e.target as HTMLInputElement;
                          input.value = input.value.replace(/[^0-9]/g, "");
                          formField.onChange(input.value);
                        }
                        : undefined
                    }
                    onKeyDown={(e) => handleKeyDown(e, field.name)}
                  />
                )}
              </FormControl>
              {field.showAddButton && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="mt-0"
                  onClick={field.onAddClick}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
            {field.description && (
              <p className="text-sm text-muted-foreground">
                {field.description}
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className={section.className}>
                {section.title && (
                  <h3 className="text-lg font-medium mb-4">{section.title}</h3>
                )}
                <div className={`grid gap-4 ${section.columns === 1 ? 'grid-cols-1' :
                    section.columns === 2 ? 'grid-cols-1 md:grid-cols-2' :
                      section.columns === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                        'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                  }`}>
                  {section.fields.map(renderField)}
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-4">
              {showCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" className={submitButtonClassName ? submitButtonClassName : 'bg-violet-500'} disabled={form.formState.isSubmitting || submitButtonProps?.disabled}>
                {form.formState.isSubmitting ? "Submitting..." : submitLabel}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}