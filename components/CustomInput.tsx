import React from 'react';
import { FormControl, FormField, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Control, FieldPath } from 'react-hook-form';
import { z } from 'zod';
import { authFormSchema } from '@/lib/utils';

const formSchema = authFormSchema('sign-up');

interface CustomInputProps {
  control: Control<z.infer<typeof formSchema>>;
  name: FieldPath<z.infer<typeof formSchema>>;
  label: string;
  placeholder?: string;
  type?: string;
  isDropdown?: boolean;
  options?: { label: string; value: string }[];
}

const CustomInput = ({
  control,
  name,
  label,
  placeholder = '',
  isDropdown = false,
  type = 'text',
}: CustomInputProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <div className="form-item">
          <FormLabel className="form-label">{label}</FormLabel>
          <div className="flex w-full flex-col">
            <FormControl>
            {!isDropdown ? (
              <Input
                placeholder={placeholder}
                className="border-slate-600 bg-[transparent] border-2 rounded"
                type={type === 'password' ? 'password' : type}
                {...field}
              />
            ) : (
              <Input
                placeholder="Select your Profile pic"
                className="border-slate-600 bg-[transparent] border-2 rounded"
                type="file"
                onChange={(e) => field.onChange(e.target.files)}
              />
            )}
            </FormControl>
            <FormMessage className="form-message mt-2" />
          </div>
        </div>
      )}
    />
  );
};

export default CustomInput;