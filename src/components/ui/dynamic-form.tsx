
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
import { CalendarIcon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FieldType = 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'date';

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
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
}

export function DynamicForm({
  title,
  sections,
  onSubmit,
  defaultValues = {},
  submitLabel = "Submit",
  showCancel = true,
  onCancel,
  className
}: DynamicFormProps) {
  // Create dynamic schema from fields
  const createSchema = () => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};
    
    sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.validation) {
          schemaFields[field.name] = field.validation;
        } else {
          let fieldSchema: z.ZodTypeAny = z.string();
          
          if (field.type === 'email') {
            fieldSchema = z.string().email('Invalid email address');
          } else if (field.type === 'date') {
            fieldSchema = z.date().optional();
          } else {
            fieldSchema = z.string();
          }
          
          if (field.required && field.type !== 'date') {
            fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.label} is required`);
          } else if (!field.required) {
            fieldSchema = fieldSchema.optional();
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
  });

  const renderField = (field: FormField) => {
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
                {field.type === 'textarea' ? (
                  <Textarea 
                    placeholder={field.placeholder}
                    className="min-h-[100px]"
                    {...formField} 
                  />
                ) : field.type === 'select' ? (
                  <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder || "Select option"} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === 'date' ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !formField.value && "text-muted-foreground"
                        )}
                      >
                        {formField.value ? (
                          format(formField.value, "MMM dd, yyyy")
                        ) : (
                          <span>{field.placeholder || "Select date"}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formField.value}
                        onSelect={formField.onChange}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Input 
                    placeholder={field.placeholder}
                    type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                    {...formField} 
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
                <div className={`grid gap-4 ${
                  section.columns === 1 ? 'grid-cols-1' :
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
              <Button type="submit" className='bg-violet-500'>
                {submitLabel}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
