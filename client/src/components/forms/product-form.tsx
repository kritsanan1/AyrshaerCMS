import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.string().min(1, "Price is required").refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Price must be a valid number"),
  sku: z.string().optional(),
  status: z.enum(["active", "inactive", "out_of_stock"]),
  inventory: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), "Inventory must be a valid number"),
  category: z.string().optional(),
  tags: z.string().optional(),
  images: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: any;
  onSuccess?: () => void;
}

export default function ProductForm({ product, onSuccess }: ProductFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price?.toString() || "",
      sku: product?.sku || "",
      status: product?.status || "active",
      inventory: product?.inventory?.toString() || "0",
      category: product?.category || "",
      tags: product?.tags?.join(", ") || "",
      images: product?.images?.join(", ") || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const payload = {
        ...data,
        price: Number(data.price),
        inventory: data.inventory ? Number(data.inventory) : 0,
        tags: data.tags ? data.tags.split(",").map(tag => tag.trim()).filter(Boolean) : [],
        images: data.images ? data.images.split(",").map(img => img.trim()).filter(Boolean) : [],
      };
      
      if (product) {
        await apiRequest("PUT", `/api/products/${product.id}`, payload);
      } else {
        await apiRequest("POST", "/api/products", payload);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Product ${product ? "updated" : "created"} successfully`,
      });
      onSuccess?.();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: `Failed to ${product ? "update" : "create"} product`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    createMutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="media">Media & Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Enter product name"
              data-testid="input-product-name"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Describe your product"
              rows={4}
              data-testid="input-product-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                {...form.register("price")}
                placeholder="0.00"
                type="number"
                step="0.01"
                min="0"
                data-testid="input-product-price"
              />
              {form.formState.errors.price && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.price.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) => form.setValue("status", value as any)}
              >
                <SelectTrigger data-testid="select-product-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              {...form.register("category")}
              placeholder="e.g., Electronics, Clothing, Books"
              data-testid="input-product-category"
            />
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div>
            <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
            <Input
              id="sku"
              {...form.register("sku")}
              placeholder="e.g., PROD-001"
              data-testid="input-product-sku"
            />
          </div>

          <div>
            <Label htmlFor="inventory">Inventory Count</Label>
            <Input
              id="inventory"
              {...form.register("inventory")}
              placeholder="0"
              type="number"
              min="0"
              data-testid="input-product-inventory"
            />
            {form.formState.errors.inventory && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.inventory.message}</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <div>
            <Label htmlFor="images">Image URLs</Label>
            <Textarea
              id="images"
              {...form.register("images")}
              placeholder="Enter image URLs separated by commas"
              rows={3}
              data-testid="input-product-images"
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter multiple image URLs separated by commas
            </p>
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              {...form.register("tags")}
              placeholder="Enter tags separated by commas"
              data-testid="input-product-tags"
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button
          type="submit"
          disabled={createMutation.isPending}
          data-testid="button-submit-product"
        >
          {createMutation.isPending ? "Saving..." : product ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
