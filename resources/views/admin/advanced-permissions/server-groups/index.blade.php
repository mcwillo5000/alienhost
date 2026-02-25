@extends('layouts.admin')

@section('title')
    Server Groups
@endsection

@section('content-header')
    <h1>Server Groups<small>Bundle servers into named lists for role-based access filtering.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.advanced-permissions') }}">Advanced Permissions</a></li>
        <li class="active">Server Groups</li>
    </ol>
@endsection

@section('content')
    <div class="row">
        <div class="col-xs-12">

            <div class="box box-primary">
                <div class="box-header with-border">
                    <h3 class="box-title">Server Groups</h3>
                    <div class="box-tools">
                        <a href="{{ route('admin.advanced-permissions.server-groups.create') }}">
                            <button type="button" class="btn btn-sm btn-primary">
                                <i class="fa fa-plus"></i> Create Group
                            </button>
                        </a>
                        <a href="{{ route('admin.advanced-permissions') }}" class="btn btn-sm btn-default" style="margin-left:6px">
                            <i class="fa fa-arrow-left"></i> Back to Roles
                        </a>
                    </div>
                </div>

                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th style="width:40px">#</th>
                                <th>Group Name</th>
                                <th>Description</th>
                                <th>Servers</th>
                                <th>Used by Roles</th>
                                <th style="width:100px">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($groups as $group)
                                <tr>
                                    <td>{{ $group->id }}</td>
                                    <td><strong>{{ $group->name }}</strong></td>
                                    <td class="text-muted">{{ $group->description ?: '—' }}</td>
                                    <td>
                                        <span class="badge bg-blue">{{ $group->servers_count }}</span>
                                    </td>
                                    <td>
                                        <span class="badge bg-green">{{ $group->roles_count }}</span>
                                    </td>
                                    <td>
                                        <a href="{{ route('admin.advanced-permissions.server-groups.edit', $group->id) }}"
                                           class="btn btn-xs btn-default">
                                            <i class="fa fa-pencil"></i> Edit
                                        </a>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="6" class="text-center text-muted" style="padding:30px">
                                        No server groups created yet.
                                        <a href="{{ route('admin.advanced-permissions.server-groups.create') }}">Create the first one.</a>
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                @if ($groups->hasPages())
                    <div class="box-footer clearfix">
                        <div class="col-md-12 text-center">
                            {!! $groups->render() !!}
                        </div>
                    </div>
                @endif
            </div>

        </div>
    </div>
@endsection
