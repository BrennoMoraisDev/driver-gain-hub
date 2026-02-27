import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAdminApi } from "@/hooks/useAdminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Crown, Ban } from "lucide-react";
import AdminUserDetails from "./admin/AdminUserDetails";

export default function AdminUserPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <AdminUserDetails />
      </div>
    </Layout>
  );
}
